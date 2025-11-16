require('dotenv').config();
const Sequelize = require('sequelize');
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

//card model
const CardModel = require('./models/Card');

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`,
    {
        logging: false,
        native: false,
    }
);

// // Initialize models
CardModel(sequelize);

// models relationships
const { Card } = sequelize.models;
// User.belongsToMany(Favorite,{through:"user_favorite"})
// Favorite.belongsToMany(User,{through:"user_favorite"})

module.exports = {
    conn: sequelize,
    Card,
    // ...sequelize.models
};