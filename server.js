const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage (Replace with database later)
let farmers = [
  {
    id: 1,
    name: 'Aline Farm',
    district: 'Gasabo',
    sector: 'Kacyiru',
    certNumber: 'RDB-2024-0102',
    certImage: 'cert-001.pdf',
    status: 'verified',
    rating: 4.8,
    products: 18,
    email: 'aline@alinefarm.rw',
    phone: '+250788123456',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Green Harvest Co.',
    district: 'Kicukiro',
    sector: 'Niboye',
    certNumber: 'RDB-2024-0217',
    certImage: 'cert-002.pdf',
    status: 'verified',
    rating: 4.9,
    products: 26,
    email: 'contact@greenharvest.rw',
    phone: '+250789654321',
    createdAt: '2024-02-10'
  },
  {
    id: 3,
    name: 'Lake Valley Farms',
    district: 'Rubavu',
    sector: 'Karongi',
    certNumber: 'RDB-2024-0110',
    certImage: 'cert-003.pdf',
    status: 'verified',
    rating: 4.7,
    products: 15,
    email: 'info@lakevalley.rw',
    phone: '+250787654321',
    createdAt: '2024-01-20'
  }
];

let products = [
  {
    id: 1,
    farmerId: 1,
    name: 'Irish Potatoes',
    category: 'Crops',
    price: 600,
    unit: 'kg',
    quantity: 120,
    description: 'Fresh Irish potatoes from certified farm in Gasabo',
    district: 'Gasabo',
    verified: true,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-10-05'
  },
  {
    id: 2,
    farmerId: 2,
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 450,
    unit: 'kg',
    quantity: 80,
    description: 'Organic tomatoes harvested fresh daily',
    district: 'Kicukiro',
    verified: true,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-10-08'
  },
  {
    id: 3,
    farmerId: 3,
    name: 'Maize Flour',
    category: 'Grains',
    price: 950,
    unit: 'bag',
    quantity: 40,
    description: 'High-quality maize flour, 50kg bags',
    district: 'Rubavu',
    verified: true,
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-10-01'
  },
  {
    id: 4,
    farmerId: 1,
    name: 'Bananas',
    category: 'Fruit',
    price: 350,
    unit: 'bunch',
    quantity: 200,
    description: 'Sweet and ripe bananas, ready to eat',
    district: 'Gasabo',
    verified: true,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80',
    createdAt: '2024-10-03'
  }
];

let orders = [];
let cart = [];
let verificationQueue = [];

const dashboardStats = {
  totalFarmers: farmers.length,
  verifiedFarmers: farmers.filter(f => f.status === 'verified').length,
  productsListed: products.length,
  ordersToday: 86,
  districtsCovered: 12,
  totalRevenue: 125000,
  monthlyGrowth: 24
};

// ============ API ENDPOINTS ============

// Dashboard & Statistics
app.get('/api/dashboard', (req, res) => {
  res.json(dashboardStats);
});

// Products endpoints
app.get('/api/products', (req, res) => {
  const { category, district, sortBy } = req.query;
  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (district) {
    filtered = filtered.filter(p => p.district === district);
  }

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(filtered);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const farmer = farmers.find(f => f.id === product.farmerId);
  res.json({ ...product, farmer });
});

app.post('/api/products', (req, res) => {
  const { farmerId, name, category, price, unit, quantity, description, district } = req.body;

  if (!farmerId || !name || !category || !price || !unit || !quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newProduct = {
    id: Math.max(...products.map(p => p.id), 0) + 1,
    farmerId,
    name,
    category,
    price,
    unit,
    quantity,
    description: description || '',
    district,
    verified: true,
    image: 'https://images.unsplash.com/photo-1500595046891-cb0bb876f296?auto=format&fit=crop&w=900&q=80',
    createdAt: new Date().toISOString().split('T')[0]
  };

  products.push(newProduct);
  dashboardStats.productsListed = products.length;

  res.status(201).json({ message: 'Product added successfully', product: newProduct });
});

// Farmers endpoints
app.get('/api/farmers', (req, res) => {
  const { status, district } = req.query;
  let filtered = [...farmers];

  if (status) {
    filtered = filtered.filter(f => f.status === status);
  }
  if (district) {
    filtered = filtered.filter(f => f.district === district);
  }

  res.json(filtered);
});

app.get('/api/farmers/:id', (req, res) => {
  const farmer = farmers.find(f => f.id === parseInt(req.params.id));
  if (!farmer) {
    return res.status(404).json({ message: 'Farmer not found' });
  }
  const farmerProducts = products.filter(p => p.farmerId === farmer.id);
  res.json({ ...farmer, products: farmerProducts });
});

// Farmer registration and verification
app.post('/api/register-farmer', (req, res) => {
  const { farmerName, district, sector, certificateNumber, cropType, email, phone } = req.body;

  if (!farmerName || !district || !certificateNumber || !email || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newFarmer = {
    id: Math.max(...farmers.map(f => f.id), 0) + 1,
    name: farmerName,
    district,
    sector: sector || '',
    certNumber: certificateNumber,
    certImage: 'pending',
    status: 'pending',
    rating: 5.0,
    products: 0,
    email,
    phone,
    createdAt: new Date().toISOString().split('T')[0]
  };

  farmers.push(newFarmer);
  verificationQueue.push(newFarmer.id);

  res.status(201).json({
    message: 'Farmer registration submitted. Your RDB certificate is pending verification.',
    farmer: newFarmer
  });
});

app.post('/api/verify-certificate', (req, res) => {
  const { certNumber } = req.body;

  if (!certNumber) {
    return res.status(400).json({ message: 'Certificate number is required' });
  }

  const farmer = farmers.find(f => f.certNumber === certNumber);

  if (farmer) {
    return res.json({
      verified: farmer.status === 'verified',
      farmer: farmer.name,
      status: farmer.status,
      district: farmer.district,
      products: farmer.products
    });
  }

  return res.json({ verified: false, message: 'Certificate not found or not yet approved' });
});

// Admin - Verify farmer
app.patch('/api/admin/verify-farmer/:id', (req, res) => {
  const farmer = farmers.find(f => f.id === parseInt(req.params.id));
  if (!farmer) {
    return res.status(404).json({ message: 'Farmer not found' });
  }

  farmer.status = 'verified';
  verificationQueue = verificationQueue.filter(id => id !== farmer.id);

  res.json({ message: 'Farmer verified successfully', farmer });
});

// Admin - Reject farmer
app.patch('/api/admin/reject-farmer/:id', (req, res) => {
  const farmer = farmers.find(f => f.id === parseInt(req.params.id));
  if (!farmer) {
    return res.status(404).json({ message: 'Farmer not found' });
  }

  farmer.status = 'rejected';
  verificationQueue = verificationQueue.filter(id => id !== farmer.id);

  res.json({ message: 'Farmer rejected', farmer });
});

// Admin - Get verification queue
app.get('/api/admin/verification-queue', (req, res) => {
  const queueFarmers = verificationQueue.map(id => farmers.find(f => f.id === id));
  res.json(queueFarmers);
});

// Orders
app.post('/api/orders', (req, res) => {
  const { buyerEmail, buyerPhone, items, totalAmount, deliveryAddress, deliveryType } = req.body;

  if (!buyerEmail || !items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ message: 'Missing required order fields' });
  }

  const newOrder = {
    id: Math.max(...orders.map(o => o.id || 0), 0) + 1,
    buyerEmail,
    buyerPhone,
    items,
    totalAmount,
    deliveryAddress,
    deliveryType: deliveryType || 'pickup',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  dashboardStats.ordersToday += 1;

  res.status(201).json({
    message: 'Order placed successfully',
    order: newOrder
  });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

// Cart
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity, product });
  }

  res.json({ message: 'Item added to cart', cart });
});

app.get('/api/cart', (req, res) => {
  res.json(cart);
});

app.delete('/api/cart/:productId', (req, res) => {
  cart = cart.filter(item => item.productId !== parseInt(req.params.productId));
  res.json({ message: 'Item removed from cart', cart });
});

// Catch-all for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AgroMarket Rwanda Full Web App running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🛒 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`👨‍🌾 Farmer Registration: http://localhost:${PORT}/register-farmer`);
  console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin\n`);
});
