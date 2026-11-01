const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// 1. BWIRA SERVER SERVING PUBLIC/FRONTEND FILES (Kugira ngo Render yerekane index.html)
app.use(express.static(__dirname));

// Function yo gusoma data.json
function readData() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            produceList: [
                { id: 1, name: "Ibigori Bizima", farmer: "Musanze Coop", district: "Musanze", price: 350, qtyKg: 5000 },
                { id: 2, name: "Ibirayi bya Musanze", farmer: "Jean Farm Ltd", district: "Musanze", price: 400, qtyKg: 12000 },
                { id: 3, name: "Inyanya Zize", farmer: "Babo Farm", district: "Bugesera", price: 600, qtyKg: 500 }
            ],
            farmers: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

// Function yo kubika muri data.json
function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------------- API ENDPOINTS ----------------

// GET: Isoko ry'Umusaruro Wose
app.get('/api/produce', (req, res) => {
    const db = readData();
    res.json({ success: true, data: db.produceList });
});

// POST: Gushyiraho Umusaruro Mushya
app.post('/api/produce', (req, res) => {
    const db = readData();
    const newProduce = {
        id: Date.now(),
        name: req.body.name,
        farmer: req.body.farmer,
        district: req.body.district,
        price: Number(req.body.price),
        qtyKg: Number(req.body.qtyKg)
    };
    db.produceList.push(newProduce);
    saveData(db);
    res.status(201).json({ success: true, message: "Umusaruro washyizwe ku isoko!", data: newProduce });
});

// POST: Kwiyandikisha kw'Umuhinzi
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
        res.status(500).json({ success: false, message: "Ikosa rya server." });
    }
});

// 2. SERVE FRONTEND INDEX.HTML KURI ROOT ('/')
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 AgroMarket Rwanda Server irakora kuri port: ${PORT}`);
});