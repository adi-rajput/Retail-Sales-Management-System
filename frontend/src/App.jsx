import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Copy, RefreshCw, Info, X, Download, Trash2, Menu } from 'lucide-react';

const SalesManagementSystem = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    regions: [],
    genders: [],
    ageRange: { min: '', max: '' },
    categories: [],
    tags: [],
    paymentMethods: [],
    dateRange: { start: '', end: '' },
    sortBy: 'customerName-asc'
  });

  // Stats
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalAmount: 0,
    totalDiscount: 0
  });

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filterOptions = {
    regions: ['North', 'South', 'East', 'West', 'Central'],
    genders: ['Male', 'Female', 'Other'],
    categories: ['Clothing', 'Beauty', 'Electronics', 'Home & Living'],
    tags: ['cotton', 'formal', 'fashion', 'casual', 'organic', 'skincare', 'unisex', 'gadgets', 'wireless', 'portable', 'smart', 'accessories', 'makeup'],
    paymentMethods: ['Credit Card', 'Debit Card', 'UPI', 'Wallet', 'Cash', 'Net Banking'],
    sortOptions: [
      { value: 'customerName-asc', label: 'Customer Name (A-Z)' },
      { value: 'customerName-desc', label: 'Customer Name (Z-A)' },
      { value: 'date-desc', label: 'Date (Newest)' },
      { value: 'date-asc', label: 'Date (Oldest)' },
      { value: 'finalAmount-desc', label: 'Amount (High to Low)' },
      { value: 'finalAmount-asc', label: 'Amount (Low to High)' }
    ]
  };

  useEffect(() => {
    fetchSalesData();
  }, [page, filters, searchTerm]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filters.regions.length) params.append('regions', filters.regions.join(','));
      if (filters.genders.length) params.append('genders', filters.genders.join(','));
      if (filters.categories.length) params.append('categories', filters.categories.join(','));
      if (filters.tags.length) params.append('tags', filters.tags.join(','));
      if (filters.paymentMethods.length) params.append('paymentMethods', filters.paymentMethods.join(','));
      if (filters.ageRange.min) params.append('minAge', filters.ageRange.min);
      if (filters.ageRange.max) params.append('maxAge', filters.ageRange.max);
      if (filters.dateRange.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange.end) params.append('endDate', filters.dateRange.end);
      
      const [sortBy, sortOrder] = filters.sortBy.split('-');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`${import.meta.env.API_URL}/api/sales?${params}`);
      const data = await response.json();
      
      setSalesData(data.data || []);
      setTotalPages(data.totalPages || 0);
      setTotal(data.total || 0);
      
      // Calculate stats
      if (data.data) {
        const units = data.data.reduce((sum, item) => sum + item.quantity, 0);
        const amount = data.data.reduce((sum, item) => sum + item.totalAmount, 0);
        const discount = data.data.reduce((sum, item) => sum + (item.totalAmount - item.finalAmount), 0);
        
        setStats({
          totalUnits: units,
          totalAmount: amount,
          totalDiscount: discount
        });
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single sale detail
  const fetchSaleDetail = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.API_URL}/api/sales/${id}`);
      const data = await response.json();
      setSelectedSale(data);
    } catch (error) {
      console.error('Error fetching sale detail:', error);
    }
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
    setPage(1);
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
    setPage(1);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRowClick = (sale) => {
    // Use existing data instead of fetching
    setSelectedSale(sale);
    // Uncomment below if you add the backend endpoint
    // fetchSaleDetail(sale._id);
  };

  const toggleRowSelection = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === salesData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(salesData.map(sale => sale._id));
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Transaction ID', 'Date', 'Customer ID', 'Customer Name', 'Phone Number',
      'Gender', 'Age', 'Region', 'Customer Type', 'Product Name', 'Brand',
      'Category', 'Quantity', 'Price/Unit', 'Discount %', 'Total Amount',
      'Final Amount', 'Payment Method', 'Order Status', 'Store Location'
    ];

    const rows = salesData.map(sale => [
      sale.transactionId,
      new Date(sale.date).toISOString().split('T')[0],
      sale.customerId,
      sale.customerName,
      sale.phoneNumber,
      sale.gender,
      sale.age,
      sale.customerRegion,
      sale.customerType,
      sale.productName,
      sale.brand,
      sale.productCategory,
      sale.quantity,
      sale.pricePerUnit,
      sale.discountPercentage,
      sale.totalAmount,
      sale.finalAmount,
      sale.paymentMethod,
      sale.orderStatus,
      sale.storeLocation
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedRows.length} selected items?`)) return;
    
    try {
      await fetch('http://localhost:5000/api/sales/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows })
      });
      
      setSelectedRows([]);
      fetchSalesData();
    } catch (error) {
      console.error('Error deleting sales:', error);
    }
  };

  const FilterDropdown = ({ title, filterKey, options }) => {
    const isOpen = openDropdown === filterKey;
    const selectedCount = filters[filterKey]?.length || 0;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : filterKey)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap"
        >
          <span className="hidden sm:inline">{title}</span>
          <span className="sm:hidden">{title.split(' ')[0]}</span>
          {selectedCount > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {selectedCount}
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px] max-h-64 overflow-y-auto">
            {options.map(option => (
              <label
                key={option}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters[filterKey].includes(option)}
                  onChange={() => toggleFilter(filterKey, option)}
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Detail Modal
  const DetailModal = () => {
    if (!selectedSale) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold">Transaction Details</h2>
            <button
              onClick={() => setSelectedSale(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Transaction Info */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Transaction Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Transaction ID</span>
                  <p className="font-semibold">{selectedSale.transactionId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Date</span>
                  <p className="font-semibold">{new Date(selectedSale.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Order Status</span>
                  <p className="font-semibold">{selectedSale.orderStatus}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Delivery Type</span>
                  <p className="font-semibold">{selectedSale.deliveryType}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Customer ID</span>
                  <p className="font-semibold">{selectedSale.customerId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Customer Name</span>
                  <p className="font-semibold">{selectedSale.customerName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone Number</span>
                  <p className="font-semibold flex items-center gap-2">
                    +91 {selectedSale.phoneNumber}
                    <button
                      onClick={() => copyToClipboard(selectedSale.phoneNumber)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Gender</span>
                  <p className="font-semibold">{selectedSale.gender}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Age</span>
                  <p className="font-semibold">{selectedSale.age} years</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Region</span>
                  <p className="font-semibold">{selectedSale.customerRegion}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Customer Type</span>
                  <p className="font-semibold">{selectedSale.customerType}</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Product Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Product ID</span>
                  <p className="font-semibold">{selectedSale.productId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Product Name</span>
                  <p className="font-semibold">{selectedSale.productName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Brand</span>
                  <p className="font-semibold">{selectedSale.brand}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category</span>
                  <p className="font-semibold">{selectedSale.productCategory}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="text-sm text-gray-600">Tags</span>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedSale.tags?.map(tag => (
                      <span key={tag} className="bg-white px-3 py-1 rounded-full text-sm border border-gray-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Quantity</span>
                  <p className="font-semibold">{selectedSale.quantity}</p>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Pricing Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Price per Unit</span>
                  <p className="font-semibold">₹{selectedSale.pricePerUnit?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Discount Percentage</span>
                  <p className="font-semibold">{selectedSale.discountPercentage}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <p className="font-semibold">₹{selectedSale.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Final Amount</span>
                  <p className="font-semibold text-black-600 text-lg">₹{selectedSale.finalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Discount Amount</span>
                  <p className="font-semibold text-black-600">-₹{(selectedSale.totalAmount - selectedSale.finalAmount)?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <p className="font-semibold">{selectedSale.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Store & Employee Info */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-800">Store & Employee Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Store ID</span>
                  <p className="font-semibold">{selectedSale.storeId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Store Location</span>
                  <p className="font-semibold">{selectedSale.storeLocation}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Salesperson ID</span>
                  <p className="font-semibold">{selectedSale.salespersonId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Employee Name</span>
                  <p className="font-semibold">{selectedSale.employeeName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setSelectedSale(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-orange-600"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 p-4 z-50 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-lg"></div>
          <div>
            <div className="font-semibold">Vault</div>
            <div className="text-sm text-gray-600">Anurag Yadav</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
            <span className="text-gray-600">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
            <span className="text-gray-600">Nexus</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
            <span className="text-gray-600">Intake</span>
          </a>
          
          <div className="pt-4">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 w-full">
              <span className="text-gray-600">Services</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </button>
            <div className="ml-6 mt-2 space-y-1">
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Pre-active
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Active
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Blocked
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Closed
              </a>
            </div>
          </div>

          <div className="pt-4">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 w-full">
              <span className="text-gray-600">Invoices</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </button>
            <div className="ml-6 mt-2 space-y-1">
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-gray-100 rounded-lg">
                Proforma Invoices
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Final Invoices
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-60 p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-semibold">Sales Management System</h1>
            </div>
            
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Name, Phone no."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 md:gap-4 mb-6 flex-wrap">
            <button
              onClick={fetchSalesData}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            <FilterDropdown title="Customer Region" filterKey="regions" options={filterOptions.regions} />
            <FilterDropdown title="Gender" filterKey="genders" options={filterOptions.genders} />

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'age' ? null : 'age')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <span className="hidden sm:inline">Age Range</span>
                <span className="sm:hidden">Age</span>
                {(filters.ageRange.min || filters.ageRange.max) && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'age' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-64">
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Min Age"
                      value={filters.ageRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        ageRange: { ...prev.ageRange, min: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max Age"
                      value={filters.ageRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        ageRange: { ...prev.ageRange, max: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <FilterDropdown title="Product Category" filterKey="categories" options={filterOptions.categories} />
            <FilterDropdown title="Tags" filterKey="tags" options={filterOptions.tags} />
            <FilterDropdown title="Payment Method" filterKey="paymentMethods" options={filterOptions.paymentMethods} />

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Date
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'date' && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 w-64">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              {selectedRows.length > 0 && (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">{selectedRows.length} selected</span>
                  <button
                    onClick={bulkDelete}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
              
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <span className="hidden lg:inline">Sort by: {filterOptions.sortOptions.find(opt => opt.value === filters.sortBy)?.label}</span>
                  <span className="lg:hidden">Sort</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {openDropdown === 'sort' && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[250px]">
                    {filterOptions.sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleSortChange(option.value);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${
                          filters.sortBy === option.value ? 'bg-gray-50 font-semibold' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Units Sold</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUnits.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-black-600">₹{stats.totalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Discounts</div>
              <div className="text-3xl font-bold text-black-600">₹{stats.totalDiscount.toLocaleString()}</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Customer ID</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Customer name</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Phone Number</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Gender</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Product Category</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-normal text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : salesData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-4 py-12 text-center text-gray-500">
                        No sales data found
                      </td>
                    </tr>
                  ) : (
                    salesData.map((sale) => (
                      <tr
                        key={sale._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm text-gray-900">{sale.transactionId}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{new Date(sale.date).toISOString().split('T')[0]}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{sale.customerId}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{sale.customerName}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            +91 {sale.phoneNumber}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(sale.phoneNumber);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{sale.gender}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{sale.age}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{sale.productCategory}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{String(sale.quantity).padStart(2, '0')}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleRowClick(sale)}
                            className="text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2 md:px-3 py-2 border rounded-lg text-sm ${
                          page === pageNum
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default SalesManagementSystem;