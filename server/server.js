
require('./config/config');

const express = require('express');
//Conexion a BD
const mongoose = require('mongoose');


const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//Esta linea indica que traiga el archivo de rutas
app.use(require('./routes/usuario'));

//Conexion a la base de datos
mongoose.connect(process.env.URLDB,
                { useNewUrlParser: true, useCreateIndex: true},    
                (err, res)=>{
    if( err ) throw err;
    console.log('BASE DE DATOS ONLINE');
});

app.listen(process.env.PORT, ( ) =>{
    console.log('Escuchando el puerto: ', process.env.PORT);
});