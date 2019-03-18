

const express = require('express');

const { verficaToken } = require('../middlewares/autenticacion');


let app = express();

let Producto = require('../models/producto');

//========================================================
// Obtener todos los productos
//========================================================

app.get('/producto', verficaToken, (req, res) => {

    //trae todos los productos
    //populate: usuario, categoria
    // paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    Producto.find({ disponible:true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( (err, productos) => {

            if ( err ){
                res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({disponible:true}, (err, conteo) =>{

                res.json({
                    ok: true,
                    productos,
                    total: conteo
                });
    
            });

        });


});

//========================================================
// Obtener producto por Id
//========================================================

app.get('/producto/:id', verficaToken, (req, res) => {
    
    //populate: usuario, categoria
    let id = req.params.id;

    Producto.findById(id)
            .populate('usuario', 'nombre email')
            .populate('categoria', 'descripcion')
            .exec( (err, productoDB) =>{

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
            
        });


    });


});

//========================================================
// Buscar productos
//========================================================

app.get('/producto/buscar/:termino', verficaToken, (req, res) =>{

    let termino = req.params.termino;

    //Expresion regular para busqueda de termino
    //Esto funciona como el like de MySql
    // 'i': No es sencible a mayusculas / minusculas
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec( (err, productos) =>{

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
    
                });
            }

            res.json({
                ok: true,
                productos
            });

        });


});

//========================================================
// Crear un nuevo producto
//========================================================

app.post('/producto', verficaToken, (req, res) => {

    //grabar el usuario
    //grabar categoria
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save( (err, productoDB) =>{

        if( err ){
            return res.status(500).json({
                ok: false,
                err

            });
        }

        if( !productoDB ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo crear el producto'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

//========================================================
// Actualizar productos
//========================================================

app.put('/producto/:id', verficaToken, (req, res) => {
    
    //grabar el usuario
    //grabar categoria
     //Actualizar la descripcion de la categoria

     let id = req.params.id;
     //let usuarioA = req.usuario._id;
    
    //Arreglo con datos a actualizar
    let body = req.body;
    //  let body = {
    //      descripcion: req.body.descripcion,
    //      categoria: req.body.categoria,
    //      usuario: req.usuario._id
    //  }
 
     Producto.findByIdAndUpdate( id, body, {new:true, runValidators:true}, ( err, productoDB) =>{
 
         if( err ) {
 
             return res.status(500).json({
                 ok: false,
                 err
             });
         }
 
         if( !productoDB ) {
 
             return res.status(400).json({
                 ok: false,
                 err: {
                     message: 'No se pudo actualizar el Producto'
                 }
             });
         }
 
         res.json({
             ok: true,
             producto: productoDB
             
         });
     
 
     });


});


//========================================================
// Eliminar producto
//========================================================

app.delete('/producto/:id', verficaToken, (req, res) => {

    //disponible debe ser igual a false

    let id = req.params.id;


    //Borrado logico solo cambia el estado a false

    let cambiaEstado = {
        disponible: false
    }

    Producto.findByIdAndUpdate( id, cambiaEstado, { new:true }, ( err, productoBorrado) =>{

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if( !productoBorrado ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });
    });

});




module.exports = app;