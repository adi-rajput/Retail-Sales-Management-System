export const buildQuery = (params) => {
    const {
      search,
      regions,
      genders,
      minAge,
      maxAge,
      categories,
      tags,
      paymentMethods,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = params;
  
    const query = {};
  
    // Search
    if (search?.trim()) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } }
      ];
    }
  
    // Filters (comma-separated lists)
    if (regions) query.customerRegion = { $in: regions.split(",") };
    if (genders) query.gender = { $in: genders.split(",") };
    if (categories) query.productCategory = { $in: categories.split(",") };
    if (paymentMethods) query.paymentMethod = { $in: paymentMethods.split(",") };
  
    if (tags) query.tags = { $in: tags.split(",") };
  
    // Age
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = Number(minAge);
      if (maxAge) query.age.$lte = Number(maxAge);
    }
  
    // Date Range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
  
    // Sorting
    const sort = {};
    const order = sortOrder === "asc" ? 1 : -1;
  
    sort[sortBy] = order;
  
    return {
      query,
      sort,
      page: Number(page),
      limit: Number(limit),
    };
  };
  