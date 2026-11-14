const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Port dynamically assigned by Render, or defaults to 5000 locally
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets from root folder
app.use(express.static(__dirname));

// Read JSON database helper
function readData() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            produceList: [
                { id: 1, name: "Ibigori Bizima", category: "Ibigori", farmer: "Musanze Coop", district: "Musanze", price: 350, qtyKg: 5000 },
                { id: 2, name: "Ibirayi bya Kinigi", category: "Ibirayi", farmer: "Jean Farm Ltd", district: "Musanze", price: 400, qtyKg: 12000 },
                { id: 3, name: "Inyanya Zize", category: "Imboga", farmer: "Babo Farm", district: "Bugesera", price: 600, qtyKg: 500 },
                { id: 4, name: "Ibishyimbo by'Umutuku", category: "Ibishyimbo", farmer: "Nyagatare Farmers", district: "Nyagatare", price: 750, qtyKg: 3000 }
            ],
            farmers: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database:", err);
        return { produceList: [], farmers: [] };
    }
}

// Write JSON database helper
function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------------- API ROUTES ----------------

// GET: All Produce Marketplace Items
app.get('/api/produce', (req, res) => {
    const db = readData();
    res.json({ success: true, data: db.produceList || [] });
});

// POST: Add Produce to Marketplace
app.post('/api/produce', (req, res) => {
    const db = readData();
    const newProduce = {
        id: Date.now(),
        name: req.body.name,
        category: req.body.category || 'Ibindi',
        farmer: req.body.farmer,
        district: req.body.district,
        price: Number(req.body.price),
        qtyKg: Number(req.body.qtyKg)
    };
    if (!db.produceList) db.produceList = [];
    db.produceList.push(newProduce);
    saveData(db);
    res.status(201).json({ success: true, message: "Umusaruro washyizwe ku isoko neza!", data: newProduce });
});

// POST: Register Farmer
app.post('/api/farmers/register', (req, res) => {
    const db = readData();
    const newFarmer = {
        id: Date.now(),
        ...req.body,
        registeredAt: new Date().toISOString()
    };
    if (!db.farmers) db.farmers = [];
    db.farmers.push(newFarmer);
    saveData(db);
    res.status(201).json({ success: true, message: "Wiyandikishije neza mu bahinzi ba AgroMarket Rwanda!" });
});

// GET: Dashboard Stats
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const db = readData();
        const totalFarmers = db.farmers ? db.farmers.length : 0;
        const totalProduceTypes = db.produceList ? db.produceList.length : 0;
        const totalStockKg = db.produceList ? db.produceList.reduce((sum, item) => sum + (Number(item.qtyKg) || 0), 0) : 0;
        const totalMarketValueRwf = db.produceList ? db.produceList.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qtyKg) || 0)), 0) : 0;

        res.status(200).json({
            success: true,
            stats: { totalFarmers, totalProduceTypes, totalStockKg, totalMarketValueRwf }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server analytics failure." });
    }
});

// ---------------- SERVE FRONTEND UI ----------------

// Catch-all route to send index.html for smooth app rendering
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 AgroMarket Rwanda Server running smoothly on port: ${PORT}`);
});
