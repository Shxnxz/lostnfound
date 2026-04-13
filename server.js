const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Models 
const Item = require('./models/Item'); 
const User = require('./models/User');
const Claim = require('./models/Claim'); // Added Claim model

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// ==========================================
// ITEM ROUTES
// ==========================================

// --- 1. SEARCH ITEMS ---
app.get('/api/items/search', async (req, res) => {
    try {
        const { category, location, type, query } = req.query;
        let filter = {};

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (location) filter.location = new RegExp(location, 'i');

        if (query) {
            filter.$or = [
                { title: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ];
        }

        const results = await Item.find(filter).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 2. REPORT LOST/FOUND ITEM (CREATE) ---
app.post('/api/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: "Failed to save record: " + err.message });
    }
});

// --- 3. GET ALL ITEMS (FOR ADMIN/LIST VIEW) ---
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().populate('user_id', 'name email');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 4. UPDATE ITEM STATUS ---
app.patch('/api/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } 
        );
        if (!updatedItem) return res.status(404).json({ message: "Item not found" });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 5. DELETE ITEM RECORD ---
app.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: "Item not found" });
        res.json({ message: "Record deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// USER ROUTES (For Prototype testing)
// ==========================================

// --- 6. CREATE A USER ---
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 7. GET ALL USERS ---
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// CLAIM ROUTES
// ==========================================

// --- 8. SUBMIT A CLAIM ---
app.post('/api/claims', async (req, res) => {
    try {
        const newClaim = new Claim(req.body);
        const savedClaim = await newClaim.save();
        res.status(201).json(savedClaim);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 9. GET ALL CLAIMS (Populated for UI) ---
app.get('/api/claims', async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate('item_id', 'title type status location')
            .populate('claimed_by', 'name email role');
        res.json(claims);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 10. UPDATE CLAIM STATUS (Approve/Reject) ---
app.patch('/api/claims/:id', async (req, res) => {
    try {
        const updatedClaim = await Claim.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!updatedClaim) return res.status(404).json({ message: "Claim not found" });

        // Logic: If claim is approved, mark the item itself as 'claimed'
        if (req.body.status === 'approved') {
            await Item.findByIdAndUpdate(updatedClaim.item_id, { status: 'claimed' });
        }

        res.json(updatedClaim);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ==========================================
// DATABASE CONNECTION & SERVER START
// ==========================================

const primaryURI = "mongodb+srv://dbuser:lostnfound1@lostnfound.3jwt2lm.mongodb.net/?appName=lostnfound";
const fallbackURI = 'mongodb://dbuser:lostnfound1@ac-ryk1bbx-shard-00-00.3jwt2lm.mongodb.net:27017,ac-ryk1bbx-shard-00-01.3jwt2lm.mongodb.net:27017,ac-ryk1bbx-shard-00-02.3jwt2lm.mongodb.net:27017/?ssl=true&replicaSet=atlas-964jea-shard-0&authSource=admin&appName=lostnfound';

mongoose.connect(primaryURI)
    .then(() => console.log("Database Connected Successfully (Primary URI)"))
    .catch(primaryErr => {
        console.warn(`Primary connection failed: ${primaryErr.message}. Attempting fallback...`);
        
        // Attempt Fallback
        mongoose.connect(fallbackURI)
            .then(() => console.log("Database Connected Successfully (Fallback URI)"))
            .catch(fallbackErr => {
                console.error("Critical: Both database connections failed.");
                console.error(fallbackErr);
            });
    });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});