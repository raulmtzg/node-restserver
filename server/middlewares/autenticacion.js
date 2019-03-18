

var jwt = require('jsonwebtoken');

//===================================
// Verificar token
//===================================

//Nota: Si no se ejecuta el next "Jamas continuará con el código"


let verficaToken = ( req, res, next )=>{

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded ) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });


};

//===================================
// Verificar ADMIN_ROLE
//===================================
let verficaAdmin_Role = ( req, res, next ) => {

    let usuario = req.usuario;

    if( usuario.role === 'ADMIN_ROLE' ) {

        next();        
        
    }else{

        return res.status(400).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });

    }

};


//===================================
// Verificar Token para Imagen
//===================================

let verificaTokenImg = ( req, res, next) =>{

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded ) => {

        if( err ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });

}


module.exports = {
    verficaToken,
    verficaAdmin_Role,
    verificaTokenImg
}