const bcrypt = require('bcrypt');
const { conn, Store, User } = require('../dbConn');

const seedAdminStore = async () => {
    try {
        // Sync database
        await conn.sync();
        
        console.log('🌱 Starting admin store seed...');
        
        // Check if admin store already exists
        const existingStore = await Store.findOne({
            where: { slug: 'admin-store' }
        });
        
        if (existingStore) {
            console.log('ℹ️  Admin store already exists. Skipping seed.');
            return existingStore;
        }
        
        // Create admin store
        const adminStore = await Store.create({
            name: 'Admin Store',
            slug: 'admin-store',
            description: 'Primary administrative store for system maintenance',
            email: 'admin@alchemist.com',
            phone: null,
            website: null,
            isActive: true,
            businessHours: {
                monday: '9:00-17:00',
                tuesday: '9:00-17:00',
                wednesday: '9:00-17:00',
                thursday: '9:00-17:00',
                friday: '9:00-17:00',
                saturday: 'closed',
                sunday: 'closed'
            },
            timezone: 'America/New_York',
            settings: {
                canManageStores: true,
                canManageUsers: true,
                isAdminStore: true
            }
        });
        
        console.log('✅ Admin store created:', adminStore.name);
        
        // Check if admin user already exists
        const existingUser = await User.findOne({
            where: { username: 'admin' }
        });
        
        if (existingUser) {
            console.log('ℹ️  Admin user already exists. Skipping user creation.');
            return adminStore;
        }
        
        // Create admin user
        const defaultPassword = 'Admin123!'; // Should be changed on first login
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        
        const adminUser = await User.create({
            storeId: adminStore.id,
            email: 'admin@alchemist.com',
            username: 'admin',
            passwordHash: passwordHash,
            firstName: 'System',
            lastName: 'Administrator',
            displayName: 'Admin',
            role: 'owner',
            permissions: [
                'manage_stores',
                'manage_users',
                'manage_inventory',
                'manage_cards',
                'view_reports',
                'system_settings'
            ],
            isActive: true,
            isEmailVerified: true
        });
        
        console.log('✅ Admin user created:', adminUser.username);
        console.log('📧 Email:', adminUser.email);
        console.log('🔑 Default password:', defaultPassword);
        console.log('⚠️  Please change the default password after first login!');
        
        return adminStore;
        
    } catch (error) {
        console.error('❌ Error seeding admin store:', error);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    seedAdminStore()
        .then(() => {
            console.log('✅ Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedAdminStore;
