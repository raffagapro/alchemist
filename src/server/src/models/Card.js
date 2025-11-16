const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const slugify = (s) => s.toString().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const Card = sequelize.define('Card', {
        // Internal ID (auto-increment)
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        
        // Scryfall Core Fields
        object: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'card'
        },
        scryfallId: {
            type: DataTypes.UUID,
            allowNull: true,
            unique: true
        },
        oracleId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        multiverseIds: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false,
            defaultValue: []
        },
        resourceId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        mtgoId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tcgplayerId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        cardmarketId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        
        // Card Identity
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: true }
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        lang: {
            type: DataTypes.STRING(5),
            allowNull: false,
            defaultValue: 'en'
        },
        releasedAt: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        
        // URIs
        uri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        scryfallUri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Layout & Image
        layout: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'normal'
        },
        highresImage: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        imageStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'missing'
        },
        imageUris: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        
        // Game Mechanics
        manaCost: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cmc: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        typeLine: {
            type: DataTypes.STRING,
            allowNull: true
        },
        oracleText: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        colors: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        colorIdentity: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        keywords: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        producedMana: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        
        // Legalities
        legalities: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        
        // Availability & Print Info
        games: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        reserved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        gameChanger: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        foil: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        nonfoil: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        finishes: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        oversized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        promo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        reprint: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        variation: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        
        // Set Information
        setId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        set: {
            type: DataTypes.STRING,
            allowNull: true
        },
        setName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        setType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        setUri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        setSearchUri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        scryfallSetUri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rulingsUri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        printsSearchUri: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Collector Info
        collectorNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        digital: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        rarity: {
            type: DataTypes.ENUM('common', 'uncommon', 'rare', 'mythic', 'special', 'bonus'),
            allowNull: false,
            defaultValue: 'common'
        },
        flavorText: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        cardBackId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        
        // Artist Info
        artist: {
            type: DataTypes.STRING,
            allowNull: true
        },
        artistIds: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            allowNull: false,
            defaultValue: []
        },
        illustrationId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        
        // Frame & Border
        borderColor: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'black'
        },
        frame: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '2015'
        },
        fullArt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        textless: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        booster: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        storySpotlight: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        
        // Rankings & Stats
        edhrecRank: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        
        // Preview Info
        preview: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        
        // Prices
        prices: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        
        // Related URIs
        relatedUris: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        
        // Purchase URIs
        purchaseUris: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        
        // Legacy fields (keeping for backward compatibility)
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        type: {
            type: DataTypes.ENUM('spell', 'creature', 'artifact', 'equipment', 'land', 'other'),
            allowNull: false,
            defaultValue: 'other'
        },
        cost: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        },
        attack: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        defense: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        health: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        attributes: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: []
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        // ownerId: {
        //     type: DataTypes.BIGINT,
        //     allowNull: true,
        //     references: { model: 'Users', key: 'id' }
        // },
        isPublished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        tableName: 'cards',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['slug'] },
            { unique: true, fields: ['scryfall_id'] },
            { fields: ['oracle_id'] },
            { fields: ['name'] },
            { fields: ['set'] },
            { fields: ['rarity'] },
            { fields: ['type_line'] },
            // { fields: ['owner_id'] }
        ],
        hooks: {
            beforeValidate: (card) => {
                if (!card.slug && card.name) {
                    card.slug = slugify(card.name);
                }
            }
        }
    });

    // Card.associate = function(models) {
    //     Card.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    // };

    return Card;
};