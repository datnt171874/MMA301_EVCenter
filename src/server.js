import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoutes from "./routes/authRoutes.js";
import { swaggerServe, swaggerSetup } from "./libs/swagger.js";


dotenv.config();
const app = express();
const PORT =  process.env.PORT || 3000;

app.use(express.json());

// Swagger
app.use("/api-docs", swaggerServe, swaggerSetup);

app.use("/api/auth", authRoutes);

connectDB().then(()=> {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
