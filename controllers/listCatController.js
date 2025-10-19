const listCatModel = require('../models/listCatModel');

exports.listCats = async (req, res) => {
    try {
        const cats = await listCatModel.getCats();
        res.json(cats);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
};

