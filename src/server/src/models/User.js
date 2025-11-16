const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        // Internal ID (auto-increment)
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
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
        
        // Authentication
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 50]
            }
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        
        // Personal Information
        firstName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        
        // Contact
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        
        // Role & Permissions
        role: {
            type: DataTypes.ENUM('owner', 'manager', 'employee', 'viewer'),
            allowNull: false,
            defaultValue: 'employee'
        },
        permissions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
            comment: 'Specific permissions assigned to this user'
        },
        
        // Account Status
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        
        // Authentication Tokens
        emailVerificationToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        
        // Profile
        avatarUrl: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Activity Tracking
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastActivity: {
            type: DataTypes.DATE,
            allowNull: true
        },
        
        // Preferences
        preferences: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            comment: 'User-specific preferences and settings'
        },
        
        // Additional Metadata
        metadata: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        tableName: 'users',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['email'] },
            { unique: true, fields: ['username'] },
            { fields: ['store_id'] },
            { fields: ['role'] },
            { fields: ['is_active'] },
            { fields: ['store_id', 'role'] }
        ],
        defaultScope: {
            attributes: { exclude: ['passwordHash', 'emailVerificationToken', 'passwordResetToken'] }
        },
        scopes: {
            withPassword: {
                attributes: { include: ['passwordHash'] }
            },
            active: {
                where: { isActive: true }
            }
        }
    });

    User.associate = function(models) {
        User.belongsTo(models.Store, {
            foreignKey: 'storeId',
            as: 'store'
        });
    };

    // Instance methods
    User.prototype.getFullName = function() {
        if (this.firstName && this.lastName) {
            return `${this.firstName} ${this.lastName}`;
        }
        return this.displayName || this.username;
    };

    User.prototype.hasPermission = function(permission) {
        return this.permissions.includes(permission);
    };

    User.prototype.updateLastLogin = function() {
        this.lastLogin = new Date();
        return this.save();
    };

    User.prototype.updateLastActivity = function() {
        this.lastActivity = new Date();
        return this.save();
    };

    return User;
};
