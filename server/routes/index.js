

const express = require('express');
const app = express();


//Estas lineas indican rutas
app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app;