# Architecture Documentation

## System Overview

The Retail Sales Management System follows a client-server architecture with clear separation between frontend and backend layers. The system is designed to handle large datasets efficiently while providing real-time search, filtering, and sorting capabilities.

## Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  State Mgmt  │  │   Services   │      │
│  │  Components  │──│   (Hooks)    │──│    (API)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────────────┬────────────────────────────┘
                                 │ HTTP/REST
                                 │
┌────────────────────────────────┴────────────────────────────┐
│                         Backend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Routes    │──│ Controllers  │──│   Services   │      │
│  │   (Express)  │  │   (Logic)    │  │  (Business)  │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                │ Mongoose ODM
                                                │
┌───────────────────────────────────────────────┼─────────────┐
│                      Database Layer           │             │
│                    ┌──────────────────────────▼──┐          │
│                    │   MongoDB Collections      │          │
│                    │  - sales (transactions)    │          │
│                    │  - indexes (text, field)   │          │
│                    └────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Folder Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── salesController.js      # Request handlers
│   ├── services/
│   │   └── salesService.js         # Business logic
│   ├── models/
│   │   └── salesModel.js           # MongoDB schema
│   ├── routes/
│   │   └── salesRoutes.js          # API endpoints
│   ├── utils/
│   │   ├── queryBuilder.js         # Query construction
│   │   └── validators.js           # Input validation
│   ├── config/
│   │   └── database.js             # DB connection
│   └── index.js                    # Entry point
├── .env                             # Environment variables
├── package.json
└── README.md
```

### Module Responsibilities

#### **index.js** (Entry Point)
- Initializes Express application
- Connects to MongoDB
- Sets up middleware (CORS, body-parser, etc.)
- Registers routes
- Starts the server

#### **routes/salesRoutes.js**
- Defines API endpoints
- Maps routes to controller methods
- Handles HTTP methods (GET, POST, DELETE)

**Endpoints:**
```javascript
GET    /api/sales              # Get paginated sales data
GET    /api/sales/:id          # Get single sale details
DELETE /api/sales/bulk-delete  # Delete multiple records
```

#### **controllers/salesController.js**
- Receives HTTP requests
- Validates request parameters
- Calls service layer methods
- Formats responses
- Handles errors

**Key Methods:**
```javascript
getAllSales(req, res)      // Handle search, filter, sort, pagination
getSaleById(req, res)      // Fetch single transaction
bulkDelete(req, res)       // Delete multiple transactions
```

#### **services/salesService.js**
- Contains business logic
- Interacts with database models
- Processes data transformations
- Performs calculations (stats, aggregations)

**Key Functions:**
```javascript
fetchSalesData(queryParams)     // Build and execute queries
calculateStats(salesData)       // Compute totals and metrics
getSaleDetails(id)              // Retrieve full transaction
```

#### **models/salesModel.js**
- Defines MongoDB schema
- Sets up indexes for performance
- Defines data validation rules
- Exports Mongoose model

**Schema Fields:**
```javascript
{
  transactionId: String (indexed),
  date: Date (indexed),
  customerId: String,
  customerName: String (text index),
  phoneNumber: String (text index),
  gender: String,
  age: Number,
  customerRegion: String,
  customerType: String,
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
  paymentMethod: String,
  orderStatus: String,
  deliveryType: String,
  storeId: String,
  storeLocation: String,
  salespersonId: String,
  employeeName: String
}
```

#### **utils/queryBuilder.js**
- Constructs MongoDB query objects
- Handles search logic (regex patterns)
- Builds filter conditions ($in, $gte, $lte)
- Applies sorting parameters

**Query Construction Logic:**
```javascript
// Search
if (searchTerm) {
  query.$or = [
    { customerName: { $regex: searchTerm, $options: 'i' } },
    { phoneNumber: { $regex: searchTerm, $options: 'i' } }
  ];
}

// Filters
if (regions) query.customerRegion = { $in: regions };
if (minAge || maxAge) query.age = { $gte: minAge, $lte: maxAge };

// Sorting
const sortOrder = { [sortBy]: sortDirection === 'asc' ? 1 : -1 };

// Pagination
const skip = (page - 1) * limit;
```

### Data Flow (Backend)

1. **Request Reception:**
   - Client sends HTTP request to `/api/sales?page=1&search=john&regions=North`
   - Express routes capture the request

2. **Controller Layer:**
   - `salesController.getAllSales()` receives request
   - Extracts query parameters
   - Validates input (page number, filters)

3. **Service Layer:**
   - `salesService.fetchSalesData()` is called
   - Calls `queryBuilder` to construct MongoDB query
   - Executes query with pagination

4. **Database Layer:**
   - MongoDB searches using indexes
   - Returns matching documents
   - Counts total results for pagination

5. **Response Formation:**
   - Service calculates statistics
   - Controller formats response:
```javascript
   {
     data: [...],
     total: 1500,
     page: 1,
     totalPages: 75,
     stats: { totalUnits, totalAmount, totalDiscount }
   }
```

6. **Response Sent:**
   - JSON response sent to client
   - Includes status code (200, 404, 500)

## Frontend Architecture

### Folder Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── SalesManagementSystem.jsx  # Main component
│   │   ├── FilterDropdown.jsx         # Reusable filter
│   │   ├── DetailModal.jsx            # Transaction details
│   │   └── Sidebar.jsx                # Navigation sidebar
│   ├── services/
│   │   └── api.js                     # API client
│   ├── utils/
│   │   ├── formatters.js              # Data formatting
│   │   └── exportCSV.js               # CSV export logic
│   ├── hooks/
│   │   └── useSalesData.js            # Custom data hook
│   ├── styles/
│   │   └── index.css                  # Global styles
│   ├── App.jsx                        # Root component
│   └── main.jsx                       # Entry point
├── public/
├── index.html
├── package.json
└── README.md
```

### Module Responsibilities

#### **main.jsx** (Entry Point)
- Renders React application
- Mounts to DOM
- Sets up providers if needed

#### **App.jsx** (Root Component)
- Wraps main application
- Sets up routing (if using React Router)
- Provides global context

#### **components/SalesManagementSystem.jsx** (Main Component)
- Manages application state
- Handles user interactions
- Orchestrates data fetching
- Renders child components

**State Management:**
```javascript
const [salesData, setSalesData] = useState([])
const [filters, setFilters] = useState({
  regions: [],
  genders: [],
  categories: [],
  // ... more filters
})
const [page, setPage] = useState(1)
const [searchTerm, setSearchTerm] = useState('')
const [sortBy, setSortBy] = useState('date-desc')
```

**Key Functions:**
```javascript
fetchSalesData()          // API call to get sales
handleFilterChange()      // Update filter state
handleSearch()            // Update search state
handleSort()              // Change sort order
handlePageChange()        // Navigate pages
exportToCSV()             // Download data
```

#### **components/FilterDropdown.jsx**
- Reusable filter component
- Multi-select functionality
- Shows selected count
- Dropdown toggle logic

#### **components/DetailModal.jsx**
- Displays full transaction details
- Organized in sections
- Print functionality
- Close/overlay interactions

#### **components/Sidebar.jsx**
- Navigation menu
- Mobile toggle functionality
- User profile display
- Menu items

#### **services/api.js**
- Centralized API calls
- Uses Axios or Fetch
- Base URL configuration
- Error handling

**API Methods:**
```javascript
export const fetchSales = async (params) => {
  const queryString = new URLSearchParams(params)
  const response = await axios.get(`/api/sales?${queryString}`)
  return response.data
}

export const fetchSaleById = async (id) => {
  const response = await axios.get(`/api/sales/${id}`)
  return response.data
}

export const bulkDeleteSales = async (ids) => {
  const response = await axios.delete('/api/sales/bulk-delete', {
    data: { ids }
  })
  return response.data
}
```

#### **utils/formatters.js**
- Date formatting
- Currency formatting
- Number formatting
- Phone number formatting

#### **utils/exportCSV.js**
- Converts data to CSV format
- Handles special characters
- Triggers download
- Formats headers

### Data Flow (Frontend)

1. **User Interaction:**
   - User applies filter (e.g., selects "North" region)
   - `setFilters()` updates state
   - `useEffect` detects state change

2. **API Call Preparation:**
   - `fetchSalesData()` is triggered
   - Constructs query parameters from state
   - Builds URL: `/api/sales?page=1&regions=North`

3. **API Request:**
   - `api.fetchSales(params)` called
   - Axios sends GET request
   - Loading state set to `true`

4. **Response Handling:**
   - Backend returns JSON response
   - Data extracted from response
   - State updated:
```javascript
   setSalesData(response.data)
   setTotal(response.total)
   setTotalPages(response.totalPages)
   setLoading(false)
```

5. **UI Re-render:**
   - React detects state changes
   - Components re-render with new data
   - Table displays filtered results
   - Pagination updates

6. **Subsequent Interactions:**
   - User changes page → preserves filters
   - User searches → resets to page 1
   - User sorts → maintains filters and search

## State Management Strategy

### Local State (useState)
Used for component-specific data that doesn't need to be shared:
- `loading`: Request in progress
- `openDropdown`: Which dropdown is open
- `sidebarOpen`: Mobile sidebar visibility
- `selectedSale`: Modal data

### Derived State
Calculated from existing state rather than stored:
- Stats (totalUnits, totalAmount) calculated from `salesData`
- Selected count badges calculated from filter arrays

### State Persistence
- Filters, search, and sort persist across page changes
- URL query params could be used for shareable links
- No localStorage used (optional enhancement)

## Performance Optimizations

### Backend Optimizations

1. **Database Indexing:**
```javascript
   // Text index for search
   schema.index({ customerName: 'text', phoneNumber: 'text' })
   
   // Field indexes for filters
   schema.index({ customerRegion: 1 })
   schema.index({ date: -1 })
   schema.index({ finalAmount: -1 })
```

2. **Query Optimization:**
   - Use projection to limit returned fields
   - Aggregate calculations server-side
   - Limit result set with pagination

3. **Response Optimization:**
   - Send only necessary data
   - Compress responses (gzip)
   - Use proper HTTP caching headers

### Frontend Optimizations

1. **Debouncing Search:**
```javascript
   useEffect(() => {
     const timer = setTimeout(() => {
       fetchSalesData()
     }, 300)
     return () => clearTimeout(timer)
   }, [searchTerm])
```

2. **Lazy Loading:**
   - Load modal content only when opened
   - Defer non-critical components

3. **Memoization:**
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for event handlers

4. **Virtual Scrolling:**
   - Could implement for very large result sets
   - Currently using pagination instead

## Error Handling

### Backend Error Handling
```javascript
try {
  const sales = await SalesModel.find(query)
  res.json({ success: true, data: sales })
} catch (error) {
  console.error('Database error:', error)
  res.status(500).json({ 
    success: false, 
    message: 'Failed to fetch sales data' 
  })
}
```

**Error Types:**
- 400: Bad Request (invalid parameters)
- 404: Not Found (resource doesn't exist)
- 500: Server Error (database/internal errors)

### Frontend Error Handling
```javascript
const fetchSalesData = async () => {
  try {
    setLoading(true)
    const response = await api.fetchSales(params)
    setSalesData(response.data)
  } catch (error) {
    console.error('Error fetching sales:', error)
    // Show error message to user
    alert('Failed to load data. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

## Security Considerations

1. **Input Validation:**
   - Validate all query parameters
   - Sanitize search inputs
   - Limit page/limit values

2. **CORS Configuration:**
   - Allow specific origins only
   - Restrict HTTP methods

3. **Rate Limiting:**
   - Limit requests per IP
   - Prevent DoS attacks

4. **Data Sanitization:**
   - Escape special characters in queries
   - Prevent NoSQL injection

## Scalability Considerations

### Current Architecture
- Handles datasets up to 100,000 records efficiently
- Single server deployment
- Suitable for small to medium workloads

### Future Enhancements
1. **Caching Layer:**
   - Redis for frequent queries
   - Cache filter options
   - Cache aggregated stats

2. **Load Balancing:**
   - Multiple backend instances
   - Nginx reverse proxy

3. **Database Optimization:**
   - Read replicas for queries
   - Sharding for very large datasets

4. **CDN for Frontend:**
   - Serve static assets from CDN
   - Reduce server load

## Deployment Architecture
```
┌──────────────────────────────────────────────────┐
│              Cloud Platform (AWS/Vercel)         │
│                                                   │
│  ┌────────────────┐         ┌─────────────────┐ │
│  │   Frontend     │         │    Backend      │ │
│  │   (Vercel)     │────────▶│   (Railway/     │ │
│  │   Port: 443    │  HTTPS  │    Render)      │ │
│  └────────────────┘         └────────┬────────┘ │
│                                       │          │
│                              ┌────────▼────────┐ │
│                              │    MongoDB      │ │
│                              │    (Atlas)      │ │
│                              └─────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Deployment Steps

**Backend (Railway/Render):**
1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables (MONGODB_URI)
4. Deploy automatically on push

**Frontend (Vercel):**
1. Push code to GitHub
2. Import repository in Vercel
3. Configure build settings
4. Set API URL environment variable
5. Deploy

**Database (MongoDB Atlas):**
1. Create cluster
2. Configure network access
3. Import data using mongoimport
4. Get connection string

## Testing Strategy

### Backend Testing
- Unit tests for services and utilities
- Integration tests for API endpoints
- Mock database for testing

### Frontend Testing
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Cypress (optional)

### Test Coverage Goals
- Controllers: 80%+
- Services: 90%+
- Components: 70%+

---

This architecture provides a solid foundation for the Retail Sales Management System while remaining flexible for future enhancements and scaling.