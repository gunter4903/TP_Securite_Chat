const express = require('express');
const listCatController = require('../controllers/listCatController');

const router = express.Router();
router.get('/listingCats', listCatController.listCats);

module.exports = router;
