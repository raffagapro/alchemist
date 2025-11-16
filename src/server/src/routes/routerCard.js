const express = require('express');
const routerCard = express.Router();
//controllers
const getCardByOracleId = require('../controllers/card/getCardByOracleId');
const getCardsByName = require('../controllers/card/getCardsByName');

// Order matters: more specific routes first
routerCard.get('/search', getCardsByName);
routerCard.get('/card/:id', getCardByOracleId);

module.exports = routerCard; 