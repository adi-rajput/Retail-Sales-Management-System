import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  phoneNumber: String,
  gender: String,
  age: Number,
  customerRegion: String,

  productId: String,
  productName: String,
  brand: String,
  productCategory: String,
  tags: [String],

  quantity: Number,
  pricePerUnit: Number,
  discountPercentage: Number,
  totalAmount: Number,
  finalAmount: Number,

  date: Date,
  paymentMethod: String,
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,
  salespersonId: String,
  employeeName: String,
});

export default mongoose.model("Sale", saleSchema);
