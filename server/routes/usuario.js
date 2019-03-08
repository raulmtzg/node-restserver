
const express = require('express');

//Se importa el modelo usuario al servidor
const Usuario = require('../models/usuario');

const app = express();

const bcrypt = require('bcrypt');

const _ = require('underscore');



app.get('/usuario', function (req, res) {

    //Parametro para indicar desde que registro quiere ver 
    //validar que sea numero
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite)


    //El segundo parametro del objeto find, especifica solo los campos que queremos devolver de la consulta
    Usuario.find({estado:true},'nombre email role estado google img')
        .skip(desde) //para paginar
        .limit(limite) //devuelve 5 registros de la consulta
        .exec( (err, usuarios) =>{

            if( err ) {

                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({estado:true}, (err, conteo) =>{

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });


        });
    


});
  
  app.post('/usuario', function (req, res) {
  
    let body = req.body;

    //Se crea un nuevo objeto con las propiedas recibidas por POST
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save( (err, usuarioDB) =>{

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Esta linea es para que no muestra el password almacenado
        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB

        });

    });

  
  });
  
  app.put('/usuario/:id', function (req, res) {

    let id = req.params.id;

    //Con la instruccion pick se extraen del objeto solo los elementos que se permitan actualizar
    let body = _.pick( req.body,['nombre', 'email', 'img', 'role', 'estado'] );

    // Estructura para enviar registro de actualizacion
    // Id: identificador del registro
    // body: es el arreglo completo de la estructura a modificar
    // { options }: parametros adicionales, en este caso new:true -> devuelve la informacion del registro actualizado
    // callback

    Usuario.findByIdAndUpdate( id, body, {new:true, runValidators:true}, ( err, usuarioDB) =>{

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
            
        });
    

    });
    


  });
  
  app.delete('/usuario/:id', function (req, res) {

    let id = req.params.id;


    //Borrado logico solo cambia el estado a false

    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate( id, cambiaEstado, { new:true }, ( err, usuarioBorrado) =>{

        if( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if( !usuarioBorrado ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    

    });

    //==========================================================================================

    //Borrado fisico
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) =>{

    //     if( err ) {

    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if( !usuarioBorrado ) {

    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });


    // });



  });

module.exports = app;