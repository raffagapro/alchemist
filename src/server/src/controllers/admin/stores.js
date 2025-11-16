const { Store, User, InventoryItem } = require('../../dbConn');

// Get all stores
const getAllStores = async (req, res) => {
    try {
        const stores = await Store.findAll({
            order: [['name', 'ASC']]
        });
        
        res.status(200).json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
};

// Get store by ID
const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Store ID is required' });
        }
        
        const store = await Store.findByPk(id);
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        res.status(200).json(store);
    } catch (error) {
        console.error('Error fetching store:', error);
        res.status(500).json({ error: 'Failed to fetch store' });
    }
};

// Create new store
const createStore = async (req, res) => {
    try {
        const { name, description, email, phone, website, addressLine1, addressLine2, city, state, postalCode, country, businessHours, timezone, settings } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Store name is required' });
        }
        
        const store = await Store.create({
            name,
            description,
            email,
            phone,
            website,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            businessHours,
            timezone,
            settings,
            isActive: true
        });
        
        res.status(201).json(store);
    } catch (error) {
        console.error('Error creating store:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Store name already exists' });
        }
        res.status(500).json({ error: 'Failed to create store' });
    }
};

// Update store
const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!id) {
            return res.status(400).json({ error: 'Store ID is required' });
        }
        
        const store = await Store.findByPk(id);
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        // Prevent updating certain protected fields
        delete updates.id;
        delete updates.createdAt;
        delete updates.updatedAt;
        
        await store.update(updates);
        
        res.status(200).json(store);
    } catch (error) {
        console.error('Error updating store:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Store name already exists' });
        }
        res.status(500).json({ error: 'Failed to update store' });
    }
};

// Delete store
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Store ID is required' });
        }
        
        const store = await Store.findByPk(id);
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        // Check if store has users or inventory
        const userCount = await User.count({ where: { storeId: id } });
        const inventoryCount = await InventoryItem.count({ where: { storeId: id } });
        
        if (userCount > 0 || inventoryCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete store with existing users or inventory',
                details: { users: userCount, inventoryItems: inventoryCount }
            });
        }
        
        await store.destroy();
        
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
};

module.exports = {
    getAllStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore
};
