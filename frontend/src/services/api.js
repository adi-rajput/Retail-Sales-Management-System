import axios from "axios";

const API_BASE = "http://localhost:5000/api/sales";

export const fetchSales = async (params) => {
  const response = await axios.get(API_BASE, { params });
  return response.data;
};
