const listCatModel = require('../models/listCatModel');

exports.listCats = async (req, res) => {
    try {
        const existing = await listCatModel.getCats();
        if (existing) return res.status(400).json({ error: 'Cats already exists' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
};

