const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const products = [
  {
    id: 1,
    name: 'Irish Potatoes',
    category: 'Crops',
    price: 600,
    unit: 'kg',
    quantity: 120,
    district: 'Gasabo',
    farmer: 'Aline Farm',
    verified: true,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 450,
    unit: 'kg',
    quantity: 80,
    district: 'Kicukiro',
    farmer: 'Green Harvest Co.',
    verified: true,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: 'Maize Flour',
    category: 'Grains',
    price: 950,
    unit: 'bag',
    quantity: 40,
    district: 'Muhanga',
    farmer: 'Kigali Grain Hub',
    verified: true,
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: 'Bananas',
    category: 'Fruit',
    price: 350,
    unit: 'bunch',
    quantity: 200,
    district: 'Rubavu',
    farmer: 'Lake Valley Farms',
    verified: true,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80'
  }
];

const farmers = [
  {
    id: 1,
    name: 'Aline Farm',
    district: 'Gasabo',
    certNumber: 'RDB-2024-0102',
    status: 'Verified',
    rating: 4.8,
    products: 18
  },
  {
    id: 2,
    name: 'Green Harvest Co.',
    district: 'Kicukiro',
    certNumber: 'RDB-2024-0217',
    status: 'Verified',
    rating: 4.9,
    products: 26
  },
  {
    id: 3,
    name: 'Lake Valley Farms',
    district: 'Rubavu',
    certNumber: 'RDB-2024-0110',
    status: 'Verified',
    rating: 4.7,
    products: 15
  }
];

const dashboardStats = {
  totalFarmers: 246,
  verifiedFarmers: 189,
  productsListed: 1375,
  ordersToday: 86,
  districtsCovered: 12,
  futureGrowth: 'Rwanda-wide market expansion'
};

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/farmers', (req, res) => {
  res.json(farmers);
});

app.get('/api/dashboard', (req, res) => {
  res.json(dashboardStats);
});

app.post('/api/register-farmer', (req, res) => {
  const { farmerName, district, certificateNumber, cropType } = req.body || {};

  if (!farmerName || !district || !certificateNumber) {
    return res.status(400).json({ message: 'Farmer name, district, and certificate number are required.' });
  }

  const newFarmer = {
    id: Date.now(),
    name: farmerName,
    district,
    certNumber: certificateNumber,
    status: 'Pending verification',
    rating: 5.0,
    products: 0,
    cropType: cropType || 'Mixed farming'
  };

  farmers.unshift(newFarmer);

  res.status(201).json({
    message: 'Farmer registration submitted successfully. Your RDB certificate is pending verification.',
    farmer: newFarmer
  });
});

app.post('/api/verify-certificate', (req, res) => {
  const { certNumber } = req.body || {};

  if (!certNumber) {
    return res.status(400).json({ message: 'Certificate number is required.' });
  }

  const found = farmers.find((farmer) => farmer.certNumber === certNumber);

  if (found) {
    return res.json({
      verified: true,
      farmer: found.name,
      status: found.status,
      district: found.district
    });
  }

  return res.json({ verified: false, message: 'Certificate not found or not yet approved.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AgroMarket Rwanda MVP running on http://localhost:${PORT}`);
});
