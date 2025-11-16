const server = require('./src/app');
const {conn} = require('./src/dbConn');
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
    // sync() creates missing tables
    // For schema changes after initial creation, consider using migrations
    // alter: true has issues with unique constraints in Sequelize
    await conn.sync();
    console.log('Database synchronized');
    console.log(`Server listening on port ${PORT}`);
});