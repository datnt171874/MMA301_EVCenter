import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import initData from "./scripts/initData.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import { swaggerServe, swaggerSetup } from "./libs/swagger.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for mobile app
app.use(
  cors({
    origin: "*", // Allow all origins for development
    credentials: true,
  })
);

app.use(express.json());

// Swagger: http://localhost:3000/api-docs/
app.use("/api-docs", swaggerServe, swaggerSetup);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/shop", shopRoutes);

connectDB().then(async () => {
  await initData();
  // Listen on 0.0.0.0 to accept connections from emulator and devices
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Accessible at: http://localhost:${PORT}`);
    console.log(`For Android emulator: http://10.0.2.2:${PORT}`);
  });
});
