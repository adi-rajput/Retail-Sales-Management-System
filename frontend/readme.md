# Frontend - Retail Sales Management System

Modern, responsive React application for managing and visualizing retail sales data.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State Management:** React Hooks (useState, useEffect)

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── SalesManagementSystem.jsx   # Main component
│   │   ├── FilterDropdown.jsx          # Reusable filter
│   │   ├── DetailModal.jsx             # Transaction details
│   │   ├── Sidebar.jsx                 # Navigation
│   │   ├── StatsCards.jsx              # Statistics display
│   │   ├── SalesTable.jsx              # Data table
│   │   └── Pagination.jsx              # Page controls
│   ├── services/
│   │   └── api.js                      # API client
│   ├── utils/
│   │   ├── formatters.js               # Data formatting
│   │   └── exportCSV.js                # CSV export
│   ├── hooks/
│   │   ├── useSalesData.js             # Data fetching
│   │   └── useDebounce.js              # Search debouncing
│   ├── styles/
│   │   └── index.css                   # Global styles
│   ├── App.jsx                         # Root component
│   └── main.jsx                        # Entry point
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### 3. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

Built files will be in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

## Features

### 1. Real-time Search
- Search across customer names and phone numbers
- Debounced input (300ms delay)
- Case-insensitive matching
- Works alongside filters

### 2. Advanced Filtering
- **Customer Region:** Multi-select dropdown
- **Gender:** Multi-select dropdown
- **Age Range:** Min/max number inputs
- **Product Category:** Multi-select dropdown
- **Tags:** Multi-select with popular options
- **Payment Method:** Multi-select dropdown
- **Date Range:** Start and end date pickers

All filters work independently and in combination.

### 3. Flexible Sorting
Sort by:
- Customer Name (A-Z, Z-A)
- Date (Newest First, Oldest First)
- Amount (High to Low, Low to High)

### 4. Smart Pagination
- 20 items per page
- Previous/Next navigation
- Direct page number selection
- Shows current position (e.g., "Showing 1 to 20 of 1500 results")
- Preserves filters, search, and sort state

### 5. Transaction Details
Click any row to view:
- Complete transaction information
- Customer details with copyable phone number
- Product information with tags
- Pricing breakdown
- Store and employee details
- Print invoice functionality

### 6. Data Export
- Export visible/filtered data to CSV
- Includes all columns
- Proper CSV formatting
- Auto-download with date-stamped filename

### 7. Bulk Operations
- Select multiple transactions
- Delete selected items in bulk
- Confirmation dialog for safety

### 8. Responsive Design
- Mobile-first approach
- Hamburger menu for mobile sidebar
- Touch-friendly interface
- Horizontal scroll for table on small screens
- Optimized layouts for all screen sizes

## Component Architecture

### Main Component (`SalesManagementSystem.jsx`)

Manages all application state and orchestrates child components.

**State:**
```javascript
const [salesData, setSalesData] = useState([])
const [loading, setLoading] = useState(true)
const [page, setPage] = useState(1)
const [totalPages, setTotalPages] = useState(0)
const [total, setTotal] = useState(0)
const [searchTerm, setSearchTerm] = useState('')
const [selectedSale, setSelectedSale] = useState(null)
const [selectedRows, setSelectedRows] = useState([])
const [sidebarOpen, setSidebarOpen] = useState(false)
const [openDropdown, setOpenDropdown] = useState(null)

const [filters, setFilters] = useState({
  regions: [],
  genders: [],
  ageRange: { min: '', max: '' },
  categories: [],
  tags: [],
  paymentMethods: [],
  dateRange: { start: '', end: '' },
  sortBy: 'customerName-asc'
})

const [stats, setStats] = useState({
  totalUnits: 0,
  totalAmount: 0,
  totalDiscount: 0
})
```

**Key Functions:**
```javascript
fetchSalesData()          // Fetch data from API
toggleFilter()            // Update filter state
handleSortChange()        // Change sort order
handleRowClick()          // Open detail modal
exportToCSV()             // Download CSV
bulkDelete()              // Delete multiple records
```

### Filter Dropdown Component

Reusable component for multi-select filters:
```javascript
<FilterDropdown 
  title="Customer Region"
  filterKey="regions"
  options={['North', 'South', 'East', 'West']}
/>
```

**Props:**
- `title`: Display name for the filter
- `filterKey`: State key in filters object
- `options`: Array of filter options

### Detail Modal Component

Shows complete transaction details in organized sections:
- Transaction Information
- Customer Information
- Product Information
- Pricing Details
- Store & Employee Information

**Features:**
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Copyable phone number
- Tag display
- Print functionality
- Close on overlay click or X button

### Stats Cards Component

Displays aggregated statistics:
- Total Units Sold
- Total Revenue
- Total Discounts

Automatically calculates from current filtered dataset.

## API Integration

### Service Layer (`services/api.js`)

Centralized API calls using Axios:
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchSales = async (params) => {
  const response = await apiClient.get('/sales', { params });
  return response.data;
};

export const fetchSaleById = async (id) => {
  const response = await apiClient.get(`/sales/${id}`);
  return response.data;
};

export const bulkDeleteSales = async (ids) => {
  const response = await apiClient.delete('/sales/bulk-delete', {
    data: { ids }
  });
  return response.data;
};
```

### Error Handling
```javascript
try {
  setLoading(true);
  const data = await fetchSales(params);
  setSalesData(data.data);
  setTotal(data.pagination.total);
} catch (error) {
  console.error('Error fetching sales:', error);
  // Show user-friendly error message
  if (error.response?.status === 404) {
    alert('No data found');
  } else {
    alert('Failed to load data. Please try again.');
  }
} finally {
  setLoading(false);
}
```

## Custom Hooks

### useDebounce Hook

Debounces search input to reduce API calls:
```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  fetchSalesData();
}, [debouncedSearch]);
```

### useSalesData Hook (Optional)

Encapsulates data fetching logic:
```javascript
function useSalesData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (params) => {
    try {
      setLoading(true);
      const response = await fetchSales(params);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
```

## Utility Functions

### Formatters (`utils/formatters.js`)
```javascript
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatPhoneNumber = (phone) => {
  return `+91 ${phone}`;
};
```

### CSV Export (`utils/exportCSV.js`)
```javascript
export const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0]);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        // Escape quotes and wrap in quotes if contains comma
        return typeof cell === 'string' && cell.includes(',')
          ? `"${cell.replace(/"/g, '""')}"`
          : cell;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
```

## Styling

### Tailwind Configuration (`tailwind.config.js`)
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316', // orange-500
      },
    },
  },
  plugins: [],
}
```

### Global Styles (`styles/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors;
  }
  
  .btn-secondary {
    @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
  }
}
```

## Responsive Breakpoints
```javascript
// Tailwind default breakpoints
sm: '640px'   // Small devices
md: '768px'   // Medium devices
lg: '1024px'  // Large devices
xl: '1280px'  // Extra large devices
2xl: '1536px' // 2X Extra large devices
```

**Usage:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## Performance Optimization

### 1. Debounced Search
Reduces API calls during typing:
```javascript
const debouncedSearch = useDebounce(searchTerm, 300);
```

### 2. Memoization
Cache expensive calculations:
```javascript
const stats = useMemo(() => {
  return salesData.reduce((acc, sale) => ({
    totalUnits: acc.totalUnits + sale.quantity,
    totalAmount: acc.totalAmount + sale.totalAmount,
    totalDiscount: acc.totalDiscount + (sale.totalAmount - sale.finalAmount)
  }), { totalUnits: 0, totalAmount: 0, totalDiscount: 0 });
}, [salesData]);
```

### 3. Code Splitting
Lazy load components:
```javascript
const DetailModal = lazy(() => import('./components/DetailModal'));

<Suspense fallback={<Loading />}>
  <DetailModal />
</Suspense>
```

### 4. Virtual Scrolling
For very large datasets (future enhancement):
```javascript
import { FixedSizeList } from 'react-window';
```

## Common Issues & Solutions

### Issue: "Network Error" or API not connecting
**Solution:**
- Check if backend server is running
- Verify VITE_API_BASE_URL in .env
- Check for CORS errors in browser console

### Issue: Filters not working
**Solution:**
- Check browser console for errors
- Verify filter state is updating
- Check API request in Network tab

### Issue: Table not responsive on mobile
**Solution:**
- Wrap table in div with `overflow-x-auto`
- Use horizontal scroll for wide tables
- Consider card layout for mobile

### Issue: Icons not showing
**Solution:**
- Ensure lucide-react is installed
- Check import statements
- Verify icon names are correct

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests (with Cypress)
```bash
npm run test:e2e
```

## Build & Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_API_BASE_URL`: Your backend URL
5. Deploy

### Deploy to Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables
4. Deploy

## Environment Variables

Development (`.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Production:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext js,jsx",
  "test": "vitest"
}
```

## Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.5.0",
  "lucide-react": "^0.263.1"
}
```

## Dev Dependencies
```json
{
  "vite": "^4.4.9",
  "tailwindcss": "^3.3.3",
  "autoprefixer": "^10.4.15",
  "postcss": "^8.4.29",
  "@vitejs/plugin-react": "^4.0.4",
  "eslint": "^8.48.0"
}
```

---

For architecture details, see `/docs/architecture.md`