const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const InventoryItem = sequelize.define('InventoryItem', {
        // Internal ID (auto-increment)
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        
        // Foreign Key to Card
        cardId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'cards',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        
        // Foreign Key to Store
        storeId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'stores',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        
        // Quantity Tracking
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            }
        },
        
        // Physical Condition
        condition: {
            type: DataTypes.ENUM('mint', 'near_mint', 'excellent', 'good', 'light_played', 'played', 'poor', 'damaged'),
            allowNull: false,
            defaultValue: 'near_mint'
        },
        
        // Card Finish Type
        finish: {
            type: DataTypes.ENUM('nonfoil', 'foil', 'etched', 'glossy'),
            allowNull: false,
            defaultValue: 'nonfoil'
        },
        
        // Language
        language: {
            type: DataTypes.STRING(5),
            allowNull: false,
            defaultValue: 'en'
        },
        
        // Signed/Altered Status
        isSigned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        isAltered: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        
        // Storage Location
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Physical location in storage (e.g., "Shelf A-12", "Box 5")'
        },
        
        // Purchase Information
        purchasePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Price paid per unit when acquired'
        },
        purchaseDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        supplier: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Where the card was acquired from'
        },
        
        // Listing Information
        listPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Current selling price'
        },
        isListed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether this item is currently available for sale'
        },
        
        // Reserved/Hold Status
        reservedQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Quantity currently reserved for pending orders'
        },
        
        // SKU (Stock Keeping Unit)
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            comment: 'Internal stock keeping unit identifier'
        },
        
        // Notes
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional notes about this inventory item'
        },
        
        // Last Stock Check
        lastStockCheck: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When the physical quantity was last verified'
        },
        
        // Additional Metadata
        metadata: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            comment: 'Additional flexible data storage'
        }
    }, {
        tableName: 'inventory_items',
        underscored: true,
        timestamps: true,
        indexes: [
            { fields: ['card_id'] },
            { fields: ['store_id'] },
            { fields: ['condition'] },
            { fields: ['finish'] },
            { fields: ['language'] },
            { fields: ['is_listed'] },
            { fields: ['location'] },
            { unique: true, fields: ['sku'] },
            // Composite index for common queries
            { fields: ['store_id', 'card_id'] },
            { fields: ['card_id', 'condition', 'finish', 'language'] },
            { fields: ['store_id', 'card_id', 'condition', 'finish', 'language'] },
            { fields: ['quantity'], where: { quantity: { [sequelize.Sequelize.Op.gt]: 0 } } }
        ],
        hooks: {
            beforeValidate: (item) => {
                // Ensure reserved quantity doesn't exceed total quantity
                if (item.reservedQuantity > item.quantity) {
                    throw new Error('Reserved quantity cannot exceed total quantity');
                }
            },
            beforeSave: (item) => {
                // Auto-generate SKU if not provided
                if (!item.sku && item.cardId) {
                    const timestamp = Date.now();
                    item.sku = `INV-${item.cardId}-${item.condition}-${item.finish}-${timestamp}`;
                }
            }
        }
    });

    InventoryItem.associate = function(models) {
        InventoryItem.belongsTo(models.Card, {
            foreignKey: 'cardId',
            as: 'card'
        });
        InventoryItem.belongsTo(models.Store, {
            foreignKey: 'storeId',
            as: 'store'
        });
    };

    // Instance methods
    InventoryItem.prototype.getAvailableQuantity = function() {
        return this.quantity - this.reservedQuantity;
    };

    InventoryItem.prototype.reserve = function(amount) {
        if (this.getAvailableQuantity() < amount) {
            throw new Error('Insufficient available quantity');
        }
        this.reservedQuantity += amount;
        return this.save();
    };

    InventoryItem.prototype.releaseReservation = function(amount) {
        if (this.reservedQuantity < amount) {
            throw new Error('Cannot release more than reserved quantity');
        }
        this.reservedQuantity -= amount;
        return this.save();
    };

    InventoryItem.prototype.adjustQuantity = function(amount) {
        const newQuantity = this.quantity + amount;
        if (newQuantity < 0) {
            throw new Error('Cannot reduce quantity below zero');
        }
        if (newQuantity < this.reservedQuantity) {
            throw new Error('Cannot reduce quantity below reserved amount');
        }
        this.quantity = newQuantity;
        return this.save();
    };

    return InventoryItem;
};
