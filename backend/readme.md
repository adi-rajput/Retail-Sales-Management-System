# Backend - Retail Sales Management System

RESTful API server for managing retail sales data with advanced querying capabilities.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Express-validator
- **Environment:** dotenv

## Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── salesController.js       # Request handlers
│   ├── services/
│   │   └── salesService.js          # Business logic
│   ├── models/
│   │   └── salesModel.js            # MongoDB schema
│   ├── routes/
│   │   └── salesRoutes.js           # API routes
│   ├── utils/
│   │   ├── queryBuilder.js          # Query construction
│   │   └── validators.js            # Input validation
│   ├── config/
│   │   └── database.js              # DB connection
│   └── index.js                     # Entry point
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sales_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales_db

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Import Sample Data

If you have a JSON file with sales data:
```bash
mongoimport --db sales_db --collection sales --file sales_data.json --jsonArray
```

If you have a CSV file:
```bash
mongoimport --db sales_db --collection sales --type csv --headerline --file sales_data.csv
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Get All Sales (with filters)
```http
GET /api/sales
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | Number | Page number (default: 1) | `page=1` |
| `limit` | Number | Items per page (default: 20) | `limit=20` |
| `search` | String | Search term for customer name/phone | `search=john` |
| `regions` | String | Comma-separated regions | `regions=North,South` |
| `genders` | String | Comma-separated genders | `genders=Male,Female` |
| `categories` | String | Comma-separated categories | `categories=Clothing,Electronics` |
| `tags` | String | Comma-separated tags | `tags=cotton,formal` |
| `paymentMethods` | String | Comma-separated payment methods | `paymentMethods=UPI,Cash` |
| `minAge` | Number | Minimum age filter | `minAge=18` |
| `maxAge` | Number | Maximum age filter | `maxAge=65` |
| `startDate` | String | Start date (YYYY-MM-DD) | `startDate=2024-01-01` |
| `endDate` | String | End date (YYYY-MM-DD) | `endDate=2024-12-31` |
| `sortBy` | String | Field to sort by | `sortBy=customerName` |
| `sortOrder` | String | Sort direction (asc/desc) | `sortOrder=asc` |

**Example Request:**
```bash
curl "http://localhost:5000/api/sales?page=1&limit=20&search=john&regions=North&sortBy=date&sortOrder=desc"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "transactionId": "TXN001",
      "date": "2024-01-15T00:00:00.000Z",
      "customerId": "CUST001",
      "customerName": "John Doe",
      "phoneNumber": "9876543210",
      "gender": "Male",
      "age": 32,
      "customerRegion": "North",
      "customerType": "Regular",
      "productId": "PROD001",
      "productName": "Cotton Shirt",
      "brand": "BrandX",
      "productCategory": "Clothing",
      "tags": ["cotton", "formal"],
      "quantity": 2,
      "pricePerUnit": 1500,
      "discountPercentage": 10,
      "totalAmount": 3000,
      "finalAmount": 2700,
      "paymentMethod": "UPI",
      "orderStatus": "Delivered",
      "deliveryType": "Home Delivery",
      "storeId": "STORE001",
      "storeLocation": "Delhi",
      "salespersonId": "EMP001",
      "employeeName": "Jane Smith"
    }
    // ... more records
  ],
  "pagination": {
    "total": 1500,
    "page": 1,
    "totalPages": 75,
    "limit": 20
  },
  "stats": {
    "totalUnits": 2500,
    "totalAmount": 3750000,
    "totalDiscount": 375000
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid page number"
}
```

#### 2. Get Single Sale
```http
GET /api/sales/:id
```

**Parameters:**
- `id` (required): MongoDB ObjectId of the sale

**Example Request:**
```bash
curl http://localhost:5000/api/sales/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "transactionId": "TXN001",
    // ... all fields
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Sale not found"
}
```

#### 3. Bulk Delete Sales
```http
DELETE /api/sales/bulk-delete
```

**Request Body:**
```json
{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "3 records deleted successfully",
  "deletedCount": 3
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "No IDs provided"
}
```

## Database Schema
```javascript
{
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true,
    index: 'text'
  },
  phoneNumber: {
    type: String,
    required: true,
    index: 'text'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  customerRegion: {
    type: String,
    index: true
  },
  customerType: {
    type: String,
    enum: ['Regular', 'Premium', 'VIP']
  },
  productId: String,
  productName: String,
  brand: String,
  productCategory: {
    type: String,
    index: true
  },
  tags: [String],
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalAmount: {
    type: Number,
    required: true
  },
  finalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    index: true
  },
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,
  salespersonId: String,
  employeeName: String
}
```

## Key Features

### 1. Search Implementation

Search uses MongoDB text indexes for efficient querying:
```javascript
// Text indexes on customerName and phoneNumber
schema.index({ customerName: 'text', phoneNumber: 'text' });

// Search query construction
if (searchTerm) {
  query.$or = [
    { customerName: { $regex: searchTerm, $options: 'i' } },
    { phoneNumber: { $regex: searchTerm, $options: 'i' } }
  ];
}
```

### 2. Multi-Select Filters

Filters use MongoDB's `$in` operator:
```javascript
if (regions && regions.length > 0) {
  query.customerRegion = { $in: regions };
}

if (categories && categories.length > 0) {
  query.productCategory = { $in: categories };
}
```

### 3. Range Filters

Age and date ranges use `$gte` and `$lte`:
```javascript
if (minAge || maxAge) {
  query.age = {};
  if (minAge) query.age.$gte = parseInt(minAge);
  if (maxAge) query.age.$lte = parseInt(maxAge);
}

if (startDate || endDate) {
  query.date = {};
  if (startDate) query.date.$gte = new Date(startDate);
  if (endDate) query.date.$lte = new Date(endDate);
}
```

### 4. Sorting

Dynamic sorting based on field and direction:
```javascript
const sortOptions = {
  [sortBy]: sortOrder === 'asc' ? 1 : -1
};

const sales = await Sales.find(query)
  .sort(sortOptions)
  .skip(skip)
  .limit(limit);
```

### 5. Pagination

Efficient pagination with skip and limit:
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const total = await Sales.countDocuments(query);
const totalPages = Math.ceil(total / limit);

const sales = await Sales.find(query)
  .skip(skip)
  .limit(limit);
```

## Error Handling

All errors are caught and returned with appropriate status codes:
```javascript
try {
  // Database operations
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

## Performance Optimization

1. **Database Indexes:**
   - Text index on customerName and phoneNumber for search
   - Field indexes on commonly filtered fields (region, category, date)
   - Compound indexes for frequently combined queries

2. **Query Optimization:**
   - Use projection to limit returned fields
   - Aggregate stats in a single query
   - Limit result sets with pagination

3. **Connection Pooling:**
   - Mongoose handles connection pooling automatically
   - Configure pool size in connection options

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Check if MongoDB is running: `mongod --version`
- Verify MONGODB_URI in .env file
- Check network access for MongoDB Atlas

### Issue: "Port 5000 already in use"
**Solution:**
- Change PORT in .env file
- Kill process using port: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

### Issue: "Search not returning results"
**Solution:**
- Ensure text indexes are created: `db.sales.getIndexes()`
- Rebuild indexes: `db.sales.reIndex()`

### Issue: "Slow query performance"
**Solution:**
- Check if indexes exist on filtered fields
- Use MongoDB Compass to analyze query performance
- Add `.explain()` to queries for debugging

## Testing

Run tests:
```bash
npm test
```

Test coverage:
```bash
npm run test:coverage
```

## Deployment

### Deploy to Railway

1. Push code to GitHub
2. Create new project on Railway
3. Connect GitHub repository
4. Add environment variables
5. Deploy

### Deploy to Render

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## Environment Variables for Production
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales_db
CORS_ORIGIN=https://your-frontend-domain.com
```

## Scripts
```json
{
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```

## Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "express-validator": "^7.0.1"
}
```

## Dev Dependencies
```json
{
  "nodemon": "^3.0.1",
  "jest": "^29.6.4",
  "supertest": "^6.3.3"
}
```

---

For architecture details, see `/docs/architecture.md`