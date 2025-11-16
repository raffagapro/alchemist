const express = require('express');
const routerCard = require('./routes/routerCard');
const routerAdmin = require('./routes/routerAdmin');

const app = express();


//if needed to enable CORS
// server.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header(
//        'Access-Control-Allow-Headers',
//        'Origin, X-Requested-With, Content-Type, Accept'
//     );
//     res.header(
//        'Access-Control-Allow-Methods',
//        'GET, POST, OPTIONS, PUT, DELETE'
//     );
//     next();
//  });

app.use(express.json());
app.use('/cards', routerCard);

app.use('/admin', routerAdmin);

module.exports = app;