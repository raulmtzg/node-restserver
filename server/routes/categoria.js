const express = require('express');

const _ = require('underscore');

let { verficaToken, verficaAdmin_Role } = require('../middlewares/autenticacion');

let Categoria = require('../models/categoria');

let app = express();


//=============================
// Mostrar todas las categorias
//=============================

//Populate: revisa que id existen en la tabla que se esta consultando para despues cargar la informacion. Como si fuera la llave foranea y trae la informacion especificada
//sort: sirve para ordenar los resultados de la consulta
app.get('/categoria', verficaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario','nombre email')
        .exec( (err, categorias) => {

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        Categoria.count( (err, conteo) =>{

            res.json({
                ok: true,
                categorias,
                cuantas: conteo
            });

        });

    });

});

//================================
// Mostrar una categorias por ID
//================================

app.get('/categoria/:id', verficaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !categoriaDB ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
            
        });

    });

    
});


//=============================
// Crear nueva categorias
//=============================

app.post('/categoria', verficaToken, (req, res) => {
    //regresa la nueva categoria
    //req.usuario._id

    let body = req.body;

    //Se crea un nuevo objeto con las propiedas recibidas por POST
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) =>{

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !categoriaDB ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo crear la Categoría'
                }
            });
        }
        
        res.json({
            ok: true,
            usuario: categoriaDB

        });

    });
    
});

//=============================
// Actualizar categorias
//=============================

app.put('/categoria/:id', verficaToken, (req, res) => {

    //Actualizar la descripcion de la categoria
    let id = req.params.id;
    

    //Con la instruccion pick se extraen del objeto solo los elementos que se permitan actualizar
    let body = _.pick( req.body,['descripcion'] );

    Categoria.findByIdAndUpdate( id, body, {new:true, runValidators:true}, ( err, categoriaDB) =>{

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !categoriaDB ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo actualizar la Categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
            
        });
    

    });
    
});

//=============================
// Delete categorias
//=============================

app.delete('/categoria/:id', [verficaToken, verficaAdmin_Role], (req, res) => {
    //Solo un administrador puede borrar cat
    //Pedir token

    let id = req.params.id;


    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) =>{

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !categoriaBorrada ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada',
            categoria: categoriaBorrada
        });


    });

    
    
});




module.exports = app;