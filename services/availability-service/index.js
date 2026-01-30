import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/mini-projet";

mongoose.connect(MONGO_URI).then(() => {
  console.log("Availability service connected to MongoDB");
});

const slotSchema = new mongoose.Schema(
  {
    proId: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["FREE", "HELD", "BOOKED"],
      default: "FREE"
    },
    holdExpiresAt: { type: Date }
  },
  { timestamps: true }
);

const Slot = mongoose.model("Slot", slotSchema);

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "availability-service" });
});

app.get("/:proId", async (req, res) => {
  const { proId } = req.params;
  const { from, to } = req.query;

  const query = { proId };
  if (from || to) {
    query.start = {};
    if (from) query.start.$gte = new Date(from);
    if (to) query.start.$lte = new Date(to);
  }

  const slots = await Slot.find(query).sort({ start: 1 });
  res.json(slots);
});

app.post("/:proId/slots", async (req, res) => {
  const { proId } = req.params;
  const { slots } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ message: "Slots array required" });
  }

  const created = await Slot.insertMany(
    slots.map((slot) => ({
      proId,
      start: slot.start,
      end: slot.end,
      status: "FREE"
    }))
  );

  res.status(201).json(created);
});

app.patch("/slots/:id/hold", async (req, res) => {
  const { id } = req.params;
  const holdDurationMinutes = Number(req.body.holdDurationMinutes || 5);
  const holdExpiresAt = new Date(Date.now() + holdDurationMinutes * 60000);

  const slot = await Slot.findOneAndUpdate(
    {
      _id: id,
      status: "FREE"
    },
    { status: "HELD", holdExpiresAt },
    { new: true }
  );

  if (!slot) {
    return res.status(409).json({ message: "Slot not available" });
  }

  res.json(slot);
});

app.patch("/slots/:id/book", async (req, res) => {
  const { id } = req.params;
  const slot = await Slot.findOneAndUpdate(
    { _id: id, status: "HELD" },
    { status: "BOOKED", holdExpiresAt: null },
    { new: true }
  );

  if (!slot) {
    return res.status(409).json({ message: "Slot not held" });
  }

  res.json(slot);
});

app.patch("/slots/:id/release", async (req, res) => {
  const { id } = req.params;
  const slot = await Slot.findOneAndUpdate(
    { _id: id, status: "HELD" },
    { status: "FREE", holdExpiresAt: null },
    { new: true }
  );

  if (!slot) {
    return res.status(404).json({ message: "Slot not found" });
  }

  res.json(slot);
});

app.listen(PORT, () => {
  console.log(`Availability service running on port ${PORT}`);
});
