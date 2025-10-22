import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();
const app = express();
const PORT =  process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);

connectDB().then(()=> {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
