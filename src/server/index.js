const server = require('./src/app');
const {conn} = require('./src/dbConn');
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
    await conn.sync({ alter: true }); // Updates tables to match models without dropping data
    console.log('Database synchronized');
    console.log(`Server listening on port ${PORT}`);
});