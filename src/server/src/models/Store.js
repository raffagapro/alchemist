const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const slugify = (s) => s.toString().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const Store = sequelize.define('Store', {
        // Internal ID (auto-increment)
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        
        // Store Identity
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        
        // Store Details
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Contact Information
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        
        // Address
        addressLine1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        addressLine2: {
            type: DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'US'
        },
        
        // Store Status
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        
        // Business Hours (JSONB for flexibility)
        businessHours: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            comment: 'Store operating hours by day of week'
        },
        
        // Store Settings
        settings: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            comment: 'Store-specific configuration settings'
        },
        
        // Timezone
        timezone: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'America/New_York'
        },
        
        // Store Image/Logo
        logoUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Additional Metadata
        metadata: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        tableName: 'stores',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['name'] },
            { unique: true, fields: ['slug'] },
            { fields: ['is_active'] },
            { fields: ['city', 'state'] }
        ],
        hooks: {
            beforeValidate: (store) => {
                if (!store.slug && store.name) {
                    store.slug = slugify(store.name);
                }
            }
        }
    });

    Store.associate = function(models) {
        Store.hasMany(models.InventoryItem, {
            foreignKey: 'storeId',
            as: 'inventoryItems'
        });
        Store.hasMany(models.User, {
            foreignKey: 'storeId',
            as: 'users'
        });
    };

    return Store;
};
