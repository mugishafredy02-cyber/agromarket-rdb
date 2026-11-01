const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
 
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
 
app.get('/api/farmers', (req, res) => {
  res.json({ success: true, data: farmers });
});
 
app.get('/api/farmers/:id', (req, res) => {
  const farmerId = parseInt(req.params.id);
  const farmer = farmers.find(f => f.id === farmerId);
  
  if (!farmer) {
    return res.status(404).json({ success: false, message: 'Umuhinzi ntiwaboneka' });
  }
  
  res.json({ success: true, data: farmer });
});
 
app.post('/api/farmers', (req, res) => {
  const { name, district, sector, certNumber, email, phone } = req.body;
  
  if (!name || !district) {
    return res.status(400).json({ success: false, message: 'Izina n\'Akarere birakenewe' });
  }
 
  const newFarmer = {
    id: farmers.length > 0 ? farmers[farmers.length - 1].id + 1 : 1,
    name,
    district,
    sector: sector || '',
    certNumber: certNumber || '',
    certImage: 'default-cert.pdf',
    status: 'pending',
    rating: 0.0,
    products: 0,
    email: email || '',
    phone: phone || '',
    createdAt: new Date().toISOString().split('T')[0]
  };
 
  farmers.push(newFarmer);
  res.status(201).json({ success: true, data: newFarmer });
});
 
app.put('/api/farmers/:id', (req, res) => {
  const farmerId = parseInt(req.params.id);
  const farmerIndex = farmers.findIndex(f => f.id === farmerId);
 
  if (farmerIndex === -1) {
    return res.status(404).json({ success: false, message: 'Umuhinzi ntiwaboneka' });
  }
 
  farmers[farmerIndex] = {
    ...farmers[farmerIndex],
    ...req.body,
    id: farmerId
  };
 
  res.json({ success: true, data: farmers[farmerIndex] });
});
 
app.delete('/api/farmers/:id', (req, res) => {
  const farmerId = parseInt(req.params.id);
  const farmerIndex = farmers.findIndex(f => f.id === farmerId);
 
  if (farmerIndex === -1) {
    return res.status(404).json({ success: false, message: 'Umuhinzi ntiwaboneka' });
  }
 
  const deletedFarmer = farmers.splice(farmerIndex, 1);
  res.json({ success: true, data: deletedFarmer[0] });
});
 
app.listen(PORT, () => {
  console.log(`Seriveri yatangiye gukora kuri http://localhost:${PORT}`);
});