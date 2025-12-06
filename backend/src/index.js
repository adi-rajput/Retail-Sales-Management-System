import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import salesRoutes from "./routes/sales.routes.js";
import Sale from "./models/Sale.js";
import mongoose from "mongoose";
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/sales", salesRoutes);
// Get single sale by ID
// app.get('/api/sales/:id', async (req, res) => {
//     try {
//       const sale = await Sale.findById(mongoose.Types.ObjectId(req.params.id));
//       if (!sale) {
//         return res.status(404).json({ error: 'Sale not found' });
//       }
//       res.json(sale);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
