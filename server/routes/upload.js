
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');


app.use( fileUpload({ useTempFiles: true }) );


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if ( !req.files ){
        
        return res.status(400).json({
            ok: false,
            err:{

                message: 'No se ha seleccionado ningun archivo'
            }

        });
    }


    //Validar tipo
    let tiposValidos =['productos', 'usuarios'];

    if ( tiposValidos.indexOf( tipo ) < 0 ){

        //Tipo no valido
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son ' + tiposValidos.join(', ')                
            }
        });

    }



    //Archivo es el nombre del input que contendra el archivo
    let archivo = req.files.archivo;

    //Obtener la extension del archivo subido
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length -1];
    
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    
    if ( extensionesValidas.indexOf( extension ) < 0 ){
        //No esta la extension
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones validas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });

    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;



    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( tipo === "usuarios" ){

            //Aquí, la imagen está cargada
            imagenUsuario(id, res, nombreArchivo);

        }else{

            imagenProducto(id, res, nombreArchivo);
            console.log('Producto');
        }

      });
});


function imagenUsuario(id, res, nombreArchivo){

    Usuario.findById( id, (err, usuarioDB) => {

        if( err ){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !usuarioDB ){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }


        borraArchivo(usuarioDB.img, 'usuarios');
        
        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) =>{

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        });



    });

}

function imagenProducto(id, res, nombreArchivo){

    Producto.findById( id, (err, productoDB) => {

        if( err ){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }


        borraArchivo(productoDB.img, 'productos');
        
        productoDB.img = nombreArchivo;

        productoDB.save( (err, productoGuardado) =>{

            if( err ){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreArchivo
            });

        });



    });
    
}


function borraArchivo(nombreImagen, tipo){

    //Obtiene la ruta de la imagen actual del usuario en la BD
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);

    //Elimina la imagen actual, para evitar la duplicidad
    if ( fs.existsSync(pathImagen) ){
        fs.unlinkSync(pathImagen);
    }

}
module.exports= app;