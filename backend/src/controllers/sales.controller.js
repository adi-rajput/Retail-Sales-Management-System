import Sale from "../models/Sale.js";
import { buildQuery } from "../services/sales.service.js";

export const getSales = async (req, res) => {
  try {
    const { query, sort, page, limit } = buildQuery(req.query);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Sale.find(query).sort(sort).skip(skip).limit(limit),
      Sale.countDocuments(query)
    ]);

    res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
