import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 4003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/mini-projet";
const AVAILABILITY_SERVICE_URL =
  process.env.AVAILABILITY_SERVICE_URL || "http://availability-service:4002";

mongoose.connect(MONGO_URI).then(() => {
  console.log("Appointment service connected to MongoDB");
});

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    proId: { type: String, required: true },
    slotId: { type: String, required: true },
    status: {
      type: String,
      enum: ["BOOKED", "CANCELLED"],
      default: "BOOKED"
    }
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "appointment-service" });
});

app.post("/", async (req, res) => {
  try {
    const { userId, proId, slotId } = req.body;
    if (!userId || !proId || !slotId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const holdResponse = await axios.patch(
      `${AVAILABILITY_SERVICE_URL}/slots/${slotId}/hold`,
      { holdDurationMinutes: 5 }
    );

    const appointment = await Appointment.create({
      userId,
      proId,
      slotId,
      status: "BOOKED"
    });

    await axios.patch(`${AVAILABILITY_SERVICE_URL}/slots/${slotId}/book`);

    res.status(201).json({ appointment, slot: holdResponse.data });
  } catch (error) {
    if (error.response?.status === 409) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    res.status(500).json({ message: "Booking failed" });
  }
});

app.get("/", async (req, res) => {
  const { userId } = req.query;
  const query = userId ? { userId } : {};
  const appointments = await Appointment.find(query).sort({ createdAt: -1 });
  res.json(appointments);
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const appointment = await Appointment.findByIdAndUpdate(
    id,
    { status: "CANCELLED" },
    { new: true }
  );

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  await axios.patch(
    `${AVAILABILITY_SERVICE_URL}/slots/${appointment.slotId}/release`
  );

  res.json(appointment);
});

app.listen(PORT, () => {
  console.log(`Appointment service running on port ${PORT}`);
});
