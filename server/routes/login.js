const express = require('express');

const bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

//Se importa el modelo usuario al servidor
const Usuario = require('../models/usuario');

const app = express();


app.post('/login', (req, res) =>{

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) =>{

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !usuarioDB ){

            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o constraseña incorrectos'
                }
            });

        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password ) ){
            
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (constraseña) incorrectos'
                }
            });
        }

        //Aqui se crea el token del usuario logeado...
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


        res.json({
            ok: true,
            usuario: usuarioDB,
            token        
        });


    });






});

//Configuraciones de Google

async function verify( token ) {
    
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

  }

//verify().catch(console.error);



app.post('/google', async (req, res) =>{

    let token = req.body.idtoken;

    let googleUser = await verify( token )
                            .catch( e => {
                                return res.status(403).json({
                                    ok: false,
                                    err: e
                                });
                            });
    
    //Valida que exista el email del usuario autenticado en la base de datos
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }


        if( usuarioDB ){
            if( usuarioDB.google === false ){
                //Es un usuario que ya fue autenticado de forma normal Sin cuenta Google
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar con su autenticacion normal'
                    }
                });

            } else {

                //Es un usuario que usa cuenta Google para iniciar Sesion
                //Renueva el token al iniciar sesion
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }
        } else{

            //El usuario no existe en la BD, es un nuevo usuario
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (err, usuarioDB) =>{

                if( err ) {

                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                //Si no hay error graba el nuevo usuario y devuelve un token valido
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });



            });

        }

    });



    // res.json({
    //     usuario: googleUser
    // });

});




module.exports = app;