# Retail Sales Management System

A full-stack web application for managing and analyzing retail sales data with advanced search, filtering, and sorting capabilities. Built to handle large datasets efficiently while maintaining a clean and intuitive user interface.

## Tech Stack

**Frontend:** React, Tailwind CSS, Lucide Icons  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Tools:** Vite, Axios

## Search Implementation Summary

Search works across customer names and phone numbers using MongoDB's text indexing. The backend converts search queries into case-insensitive regex patterns that match partial strings. Results update in real-time as you type, and search state persists through filter and sort operations.

## Filter Implementation Summary

Filters use a multi-select approach where users can pick multiple options for regions, genders, categories, tags, and payment methods. Age and date filters support range selection. The backend builds dynamic MongoDB queries using `$in` operators for multi-select and `$gte`/`$lte` for ranges. All filters work together - applying a gender filter doesn't reset your region selection.

## Sorting Implementation Summary

Sorting is handled server-side using MongoDB's `.sort()` method. Users can sort by customer name (A-Z or Z-A), date (newest/oldest), or amount (high/low). The frontend sends sort parameters via URL query strings, and the backend applies them before pagination. Active filters and search terms stay intact when changing sort order.

## Pagination Implementation Summary

Pagination splits results into pages of 20 items each using MongoDB's `.skip()` and `.limit()` methods. The backend calculates total pages based on filtered result count and sends metadata along with the current page's data. Navigation buttons (Previous/Next and numbered pages) update the page parameter while preserving all active filters, search, and sort settings.

## Setup Instructions

**Backend:**
```bash
cd backend
npm install
# Create .env file with: MONGODB_URI=your_mongodb_connection_string
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` and frontend on `http://localhost:5173`. Make sure MongoDB is running before starting the backend.

**Data Import:**
Import the provided dataset into MongoDB using:
```bash
mongoimport --db sales --collection transactions --file sales_data.json --jsonArray
```

---

Built as part of the TruEstate SDE Intern assignment.