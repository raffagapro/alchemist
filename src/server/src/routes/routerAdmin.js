const express = require('express');
const routerAdmin = express.Router();
const { getAllStores, getStoreById, createStore, updateStore, deleteStore } = require('../controllers/admin/stores');

// Store routes
routerAdmin.get('/stores', getAllStores);
routerAdmin.get('/stores/:id', getStoreById);
routerAdmin.post('/stores', createStore);
routerAdmin.put('/stores/:id', updateStore);
routerAdmin.delete('/stores/:id', deleteStore);

module.exports = routerAdmin; 