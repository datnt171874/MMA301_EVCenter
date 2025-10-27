import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import initData from "./scripts/initData.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import { swaggerServe, swaggerSetup } from "./libs/swagger.js";


dotenv.config();
const app = express();
const PORT =  process.env.PORT || 3000;

app.use(express.json());

// Swagger
app.use("/api-docs", swaggerServe, swaggerSetup);


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/wallet", walletRoutes);

connectDB().then(async () => {
    await initData();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
