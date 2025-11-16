require('dotenv').config();
const Sequelize = require('sequelize');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

// Import models
const CardModel = require('./models/Card');
const StoreModel = require('./models/Store');
const UserModel = require('./models/User');
const InventoryItemModel = require('./models/InventoryItem');

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
    {
        logging: false,
        native: false,
    }
);

// Initialize models
CardModel(sequelize);
StoreModel(sequelize);
UserModel(sequelize);
InventoryItemModel(sequelize);

// Get model instances
const { Card, Store, User, InventoryItem } = sequelize.models;

// Set up model associations
Object.keys(sequelize.models).forEach(modelName => {
    if (sequelize.models[modelName].associate) {
        sequelize.models[modelName].associate(sequelize.models);
    }
});

module.exports = {
    conn: sequelize,
    Card,
    Store,
    User,
    InventoryItem,
    // ...sequelize.models
};