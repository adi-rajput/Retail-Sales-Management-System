import dotenv from "dotenv";
import mongoose from "mongoose";
import csv from "csvtojson";
import Sale from "../models/Sale.js";
import connectDB from "../config/db.js";

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    const jsonArray = await csv().fromFile("./src/utils/data.csv");
    console.log("Total rows loaded:", jsonArray.length);

    const formatted = jsonArray.map((item) => ({
      transactionId: item["Transaction ID"],
      date: new Date(item["Date"]),

      customerId: item["Customer ID"],
      customerName: item["Customer Name"],
      phoneNumber: item["Phone Number"],
      gender: item["Gender"],
      age: Number(item["Age"]),
      customerRegion: item["Customer Region"],
      customerType: item["Customer Type"],

      productId: item["Product ID"],
      productName: item["Product Name"],
      brand: item["Brand"],
      productCategory: item["Product Category"],

      tags: item["Tags"] ? item["Tags"].replace(/"/g, "").split(",") : [],

      quantity: Number(item["Quantity"]),
      pricePerUnit: Number(item["Price per Unit"]),
      discountPercentage: Number(item["Discount Percentage"]),
      totalAmount: Number(item["Total Amount"]),
      finalAmount: Number(item["Final Amount"]),

      paymentMethod: item["Payment Method"],
      orderStatus: item["Order Status"],
      deliveryType: item["Delivery Type"],
      storeId: item["Store ID"],
      storeLocation: item["Store Location"],
      salespersonId: item["Salesperson ID"],
      employeeName: item["Employee Name"],
    }));
    const smallSample = formatted.slice(700001, 800000);
    console.log("Trying to insert 100 rows...");
    await Sale.insertMany(smallSample);

    console.log("Data imported successfully!");
    process.exit();
  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
};

importData();
