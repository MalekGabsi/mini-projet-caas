import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));

const userServiceUrl = process.env.USER_SERVICE_URL || "http://user-service:4001";
const availabilityServiceUrl =
  process.env.AVAILABILITY_SERVICE_URL || "http://availability-service:4002";
const appointmentServiceUrl =
  process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:4003";

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

app.use(
  "/api/users",
  createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" }
  })
);

app.use(
  "/api/availability",
  createProxyMiddleware({
    target: availabilityServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/availability": "" }
  })
);

app.use(
  "/api/appointments",
  createProxyMiddleware({
    target: appointmentServiceUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/appointments": "" }
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
