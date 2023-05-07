require('dotenv').config('/.env');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Yup = require('yup');
const User = require('./schemas/model.user');
const { spicSchema } = require('./schemas/model.s2');
const { ssancionadosSchema } = require('./schemas/model.s3s');
const { psancionadosSchema } = require('./schemas/model.s3p');
const Provider = require('./schemas/model.proovedor');
const Catalog = require('./schemas/model.catalog');
const Bitacora = require('./schemas/model.bitacora');
const proveedorRegistros = require('./schemas/model.proveedorRegistros');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const yaml = require('js-yaml');
const fs = require('fs');
// const regeneratorRuntime = require('regenerator-runtime');
const { SMTPClient } = require('emailjs');
let app = express();
app.use(cors(), bodyParser.urlencoded({ extended: true }), bodyParser.json());
const port = 3004
const host = '127.0.0.1'
// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import path from 'path';
// import * as Yup from 'yup';
// import User from './schemas/model.user';
// import { spicSchema } from './schemas/model.s2';
// import { ssancionadosSchema } from './schemas/model.s3s';
// import { psancionadosSchema } from './schemas/model.s3p';
// import Provider from './schemas/model.proovedor';
// import Catalog from './schemas/model.catalog';
// import Bitacora from './schemas/model.bitacora';
// import proveedorRegistros from './schemas/model.proveedorRegistros';
// import moment from 'moment-timezone';
// const mongoose = require('mongoose');
// const yaml = require('js-yaml');
// const fs = require('fs');
// import regeneratorRuntime from 'regenerator-runtime';
// import { SMTPClient } from 'emailjs';

var swaggerValidator = require('swagger-object-validator');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
const { esquemaS2, schemaUserCreate, schemaUser, schemaProvider } = require('./schemas/yup.esquemas');
// import regeneratorRuntime from 'regenerator-runtime';
// import { SMTPClient } from 'emailjs';

   if(typeof process.env.EMAIL === 'undefined') {
     console.log('no existe el valor de EMAIL en las variables de entorno');
     process.exit(1);
     }

// if (typeof process.env.PASS_EMAIL === 'undefined') {
//   console.log('no existe el valor de PASS_EMAIL en las variables de entorno');
//   process.exit(1);
// }

// if (typeof process.env.HOST_EMAIL === 'undefined') {
//   console.log('no existe el valor de HOST_EMAIL en las variables de entorno sos');
//   process.exit(1);
// }

//console.table({ email: process.env.EMAIL, pass: process.env.PASS_EMAIL, host: process.env.HOST_EMAIL });

//connection mongo db
// console.log('mongodb://' + process.env.USERMONGO + ':' + process.env.PASSWORDMONGO + '@' + process.env.HOSTMONGO + '/' + process.env.DATABASE);
//+ process.env.USERMONGO + ':' + process.env.PASSWORDMONGO + '@' + 
const db = mongoose
  .connect('mongodb://'+process.env.USERMONGO+':'+ process.env.PASSWORDMONGO + process.env.HOSTMONGO+process.env.DATABASE+'?authSource=admin', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connect to MongoDB..'))
  .catch(err => console.error('Could not connect to MongoDB..', err));
mongoose.set('useFindAndModify', false);

let S2 = mongoose.connection.useDb('S2');
let S3S = mongoose.connection.useDb('S3_Servidores');
let S3P = mongoose.connection.useDb('S3_Particulares');



app.listen(port,host ,() => {
  console.log(' function cloud Server is listening at http://'+host+':'+port);
});

function getArrayFormatTipoProcedimiento(array) {
  _.each(array, function (p) {
    p.clave = parseInt(p.clave);
  });
  return array;
}

var validateToken = function (req) {
  var inToken = null;
  var auth = req.headers['authorization'];

  if (auth && auth.toLowerCase().indexOf('bearer') == 0) {
    inToken = auth.slice('bearer '.length);
  } else if (req.body && req.body.access_token) {
    inToken = req.body.access_token;
  } else if (req.query && req.query.access_token) {
    inToken = req.query.access_token;
  }
  // invalid token - synchronous
  try {
    var decoded = jwt.verify(inToken, process.env.SEED);
    return { code: 200, message: decoded };
  } catch (err) {
    // err
    let error = '';
    if (err.message === 'jwt must be provided') {
      error = 'Error el token de autenticación (JWT) es requerido en el header, favor de verificar';
    } else if (err.message === 'invalid signature' || err.message.includes('Unexpected token')) {
      error = 'Error token inválido, el token probablemente ha sido modificado favor de verificar';
    } else if (err.message === 'jwt expired') {
      error = 'Sesión expirada';
    } else {
      error = err.message;
    }
    let obj = { code: 401, message: error };
    return obj;
  }
};

async function registroBitacora(data) {
  let response;
  const nuevaBitacora = new Bitacora(data);
  response = await nuevaBitacora.save();
}

async function validateSchema(doc, schema, validacion) {
  let objError = { valid: true };
  let result = await validacion.validateModel(doc, schema);

  if (result.errors.length > 0) {
    // let arrayErrors = result.errorsWithStringTypes();
    let arrayErrors = result.errors;
    let textErrors;
    if (Array.isArray(doc)) {
      objError['docId'] = doc[0].id;
    } else {
      console.log('validateSchema docId', doc.id);
      objError['docId'] = doc.id;
    }
    objError['valid'] = arrayErrors.length === 0 ? true : false;
    objError['errorCount'] = arrayErrors.length;

    let errors = [];
    for (let error of arrayErrors) {
      let obj = {};
      obj['typeError'] = error.errorType;
      let path = '';
      for (let ruta of error.trace) {
        path = path + ruta.stepName + '/';
      }
      obj['pathError'] = path;
      errors.push(obj);
    }
    objError['errors'] = errors;
    objError['errorsHumanReadable'] = result.humanReadable();
  }
  return objError;
}

app.post('/validateSchemaS2', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.headers.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis2.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaS2 = data.components.schemas.respSpic;
      let validacion = new swaggerValidator.Handler();

      let newdocument = req.body;
      let respuesta = [];
      let arrayDocuments = [];
      let ids = [];
      let c1 = 1;
      if (Array.isArray(newdocument)) {
        for (let doc of newdocument) {
          doc['id'] = c1.toString();
          doc['fechaCaptura'] = moment().format();
          if (doc['tipoProcedimiento']) {
            if (doc['tipoProcedimiento'].length === 0) {
              delete doc['tipoProcedimiento'];
            }
          }
          c1++;
          respuesta.push(await validateSchema([doc], schemaS2, validacion));
          ids.push(doc.id);
          arrayDocuments.push(doc);
        }
      } else {
        newdocument['id'] = c1.toString();
        newdocument['fechaCaptura'] = moment().format();
        if (newdocument['tipoProcedimiento']) {
          if (newdocument['tipoProcedimiento'].length === 0) {
            delete newdocument['tipoProcedimiento'];
          }
        }
        c1++;
        respuesta.push(await validateSchema([newdocument], schemaS2, validacion));
        arrayDocuments.push(newdocument);
      }

      let wasInvalid;

      for (let val of respuesta) {
        if (!val.valid) {
          wasInvalid = true;
        }
      }

      if (wasInvalid) {
        res.status(500).json({ message: 'Error : La validación no fue exitosa', Status: 500, response: respuesta });
      } else {
        //se insertan
        try {
          let Spic = S2.model('Spic', spicSchema, 'spic');
          let response;
          response = await Spic.insertMany(arrayDocuments);
          let detailObject = {};
          detailObject['numeroRegistros'] = arrayDocuments.length;

          var datausuario = await User.findById(usuario);
          response.map(async row => {
            const proveedorRegistros1 = new proveedorRegistros({ proveedorId: datausuario.proveedorDatos, registroSistemaId: row._id, sistema: 'S2' });
            var resp = await proveedorRegistros1.save();
          });
          var bitacora = [];
          bitacora['tipoOperacion'] = 'CREATE';
          bitacora['fechaOperacion'] = moment().format();
          bitacora['usuario'] = usuario;
          bitacora['numeroRegistros'] = arrayDocuments.length;
          bitacora['sistema'] = 'S2';
          registroBitacora(bitacora);
          res.status(200).json({ message: 'Se realizarón las inserciones correctamente', Status: 200, response: response, detail: detailObject });
        } catch (e) {
          console.log(e);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/validateSchemaS3S', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.headers.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis3s.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaResults = data.components.schemas.ssancionados.properties.results;
      schemaResults.items.properties.tipoFalta = data.components.schemas.tipoFalta;
      schemaResults.items.properties.tipoSancion = data.components.schemas.tipoSancion;

      let schemaS3S = schemaResults;

      let validacion = new swaggerValidator.Handler();
      let newdocument = req.body;
      let respuesta = [];
      let arrayDocuments = [];
      let ids = [];
      let c1 = 1;
      if (Array.isArray(newdocument)) {
        for (let doc of newdocument) {
          doc['id'] = c1.toString();
          if (doc['tipoSancion'].length === 0) {
            delete doc['tipoSancion'];
          }
          c1++;
          respuesta.push(await validateSchema([doc], schemaS3S, validacion));
          ids.push(doc.id);
          arrayDocuments.push(doc);
        }
      } else {
        newdocument['id'] = c1.toString();
        if (newdocument['tipoSancion'].length === 0) {
          delete newdocument['tipoSancion'];
        }
        c1++;
        respuesta.push(await validateSchema([newdocument], schemaS3S, validacion));
        arrayDocuments.push(newdocument);
      }

      let wasInvalid;

      for (let val of respuesta) {
        if (!val.valid) {
          wasInvalid = true;
        }
      }

      if (wasInvalid) {
        res.status(500).json({ message: 'Error : La validación no fue exitosa', Status: 500, response: respuesta });
      } else {
        //se insertan
        try {
          let sancionados = S3S.model('Ssancionados', ssancionadosSchema, 'ssancionados');
          let response;
          response = await sancionados.insertMany(arrayDocuments);
          var datausuario = await User.findById(usuario);
          response.map(async row => {
            const proveedorRegistros1 = new proveedorRegistros({ proveedorId: datausuario.proveedorDatos, registroSistemaId: row._id, sistema: 'S3S' });
            var resp = await proveedorRegistros1.save();
          });
          var bitacora = [];
          bitacora['tipoOperacion'] = 'CREATE';
          bitacora['fechaOperacion'] = moment().format();
          bitacora['usuario'] = usuario;
          bitacora['numeroRegistros'] = arrayDocuments.length;
          bitacora['sistema'] = 'S3S';
          registroBitacora(bitacora);
          let detailObject = {};
          detailObject['numeroRegistros'] = arrayDocuments.length;
          res.status(200).json({ message: 'Se realizarón las inserciones correctamente', Status: 200, response: response, detail: detailObject });
        } catch (e) {
          console.log(e);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/validateSchemaS3P', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.headers.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis3p.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaResults = data.components.schemas.resParticularesSancionados.properties.results;
      schemaResults.items.properties.particularSancionado.properties.domicilioExtranjero.properties.pais = data.components.schemas.pais;
      schemaResults.items.properties.tipoSancion = data.components.schemas.tipoSancion;

      let schemaS3P = schemaResults;

      let validacion = new swaggerValidator.Handler();
      let newdocument = req.body;
      let respuesta = [];
      let arrayDocuments = [];
      let ids = [];
      let c1 = 1;
      if (Array.isArray(newdocument)) {
        for (let doc of newdocument) {
          doc['id'] = c1.toString();
          doc['fechaCaptura'] = moment().format();
          if (doc['tipoSancion'].length === 0) {
            console.log('no tiene datos');
            delete doc['tipoSancion'];
          }
          c1++;
          respuesta.push(await validateSchema([doc], schemaS3P, validacion));
          ids.push(doc.id);
          arrayDocuments.push(doc);
        }
      } else {
        newdocument['id'] = c1.toString();
        if (newdocument['tipoSancion'].length === 0) {
          console.log('no tiene datos');
          delete newdocument['tipoSancion'];
        }
        newdocument['fechaCaptura'] = moment().format();
        c1++;
        respuesta.push(await validateSchema([newdocument], schemaS3P, validacion));
        arrayDocuments.push(newdocument);
      }

      let wasInvalid;

      for (let val of respuesta) {
        if (!val.valid) {
          wasInvalid = true;
        }
      }

      if (wasInvalid) {
        res.status(500).json({ message: 'Error : La validación no fue exitosa', Status: 500, response: respuesta });
      } else {
        //se insertan
        console.log('paso la validacion');
        try {
          let psancionados = S3P.model('Psancionados', psancionadosSchema, 'psancionados');
          let response;
          response = await psancionados.insertMany(arrayDocuments);

          var datausuario = await User.findById(usuario);
          response.map(async row => {
            const proveedorRegistros1 = new proveedorRegistros({ proveedorId: datausuario.proveedorDatos, registroSistemaId: row._id, sistema: 'S3P' });
            var resp = await proveedorRegistros1.save();
          });
          var bitacora = [];
          bitacora['tipoOperacion'] = 'CREATE';
          bitacora['fechaOperacion'] = moment().format();
          bitacora['usuario'] = usuario;
          bitacora['numeroRegistros'] = arrayDocuments.length;
          bitacora['sistema'] = 'S3P';
          registroBitacora(bitacora);
          let detailObject = {};
          detailObject['numeroRegistros'] = arrayDocuments.length;
          res.status(200).json({ message: 'Se realizarón las inserciones correctamente', Status: 200, response: response, detail: detailObject });
        } catch (e) {
          console.log(e);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.delete('/deleteUser', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      if (req.body.request._id) {
        var data = [];

        let fechabaja = moment().format();
        let response = await User.findByIdAndUpdate(req.body.request._id, { $set: { fechaBaja: fechabaja } }).exec();
        res.status(200).json({ message: 'OK', Status: 200, response: response });
      } else {
        res.status(500).json([{ Error: 'Datos incompletos' }]);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.delete('/deleteProvider', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      if (req.body.request._id) {
        let fechabaja = moment().format();
        let response = await Provider.findByIdAndUpdate(req.body.request._id, { $set: { fechaBaja: fechabaja, estatus: false } }).exec();
        let users = await User.updateMany({ proveedorDatos: req.body.request._id }, { $set: { estatus: false } });
        res.status(200).json({ message: 'OK', Status: 200, response: response });
      } else {
        res.status(500).json({ message: 'Error : Datos incompletos', Status: 500 });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/create/provider', async (req, res) => {
  try {
    var code = validateToken(req);

    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      try {
        await schemaProvider.validate({
          dependencia: req.body.dependencia,
          sistemas: req.body.sistemas,
          estatus: true,
          fechaAlta: moment().format()
        });
        req.body['estatus'] = true;

        const nuevoProovedor = new Provider(req.body);
        let responce;
        responce = await nuevoProovedor.save();

        res.status(200).json(responce);
      } catch (e) {
        let errorMessage = {};
        errorMessage['errores'] = e.errors;
        errorMessage['campo'] = e.path;
        errorMessage['tipoError'] = e.type;
        errorMessage['mensaje'] = e.message;
        res.status(400).json(errorMessage);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.put('/edit/provider', async (req, res) => {
  try {
    var code = validateToken(req);

    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      try {
        await Yup.object().shape({ fechaActualizacion: Yup.string().required() }).concat(schemaProvider).validate({
          dependencia: req.body.dependencia,
          sistemas: req.body.sistemas,
          estatus: req.body.estatus,
          fechaActualizacion: moment().format()
        });

        const nuevoProovedor = new Provider(req.body);
        let responce;

        if (req.body._id) {
          if (req.body.estatus == false) {
            User.updateMany({ proveedorDatos: req.body._id }, { estatus: false }).exec();
          }
          var id = req.body._id.toString();
          var sistemasproveedor = req.body.sistemas;
          var usuarios = await User.find({ proveedorDatos: id });
          var nuevoSistemas = [];

          usuarios.map(async row => {
            if (sistemasproveedor.length < row.sistemas.length) {
              nuevoSistemas = [];
              row.sistemas.map(sistemasusuario => {
                sistemasproveedor.map(sistema => {
                  if (sistema == sistemasusuario) {
                    nuevoSistemas.push(sistema);
                  }
                });
              });
              await User.updateOne({ _id: row._id }, { sistemas: nuevoSistemas });
            } else if ((sistemasproveedor.length == 2 || sistemasproveedor.length == 1) && (row.sistemas.length == 1 || row.sistemas.length == 2)) {
              nuevoSistemas = [];
              row.sistemas.map(sistemasusuario => {
                sistemasproveedor.map(sistema => {
                  if (sistema == sistemasusuario) {
                    nuevoSistemas.push(sistema);
                  }
                });
              });
              await User.updateOne({ _id: row._id }, { sistemas: nuevoSistemas });
            }
          });

          responce = await Provider.findByIdAndUpdate(req.body._id, nuevoProovedor).exec();
          res.status(200).json(responce);
        } else {
          res.status(500).json({ message: 'Error : Datos incompletos', Status: 500 });
        }
      } catch (e) {
        let errorMessage = {};
        errorMessage['errores'] = e.errors;
        errorMessage['campo'] = e.path;
        errorMessage['tipoError'] = e.type;
        errorMessage['mensaje'] = e.message;
        res.status(400).json(errorMessage);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/create/user', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      try {
        var correoexiste = await User.find({ correoElectronico: { $regex: new RegExp('^' + req.body.correoElectronico, 'i') } }, { fechaBaja: { $eq: null } }).countDocuments();
        if (correoexiste === undefined) {
          correoexiste = 0;
        }

        var usuarioexiste = await User.find({ usuario: { $regex: new RegExp('^' + req.body.usuario, 'i') } }, { fechaBaja: { $eq: null } }).countDocuments();
        if (usuarioexiste === undefined) {
          usuarioexiste = 0;
        }

        if (correoexiste > 0 || usuarioexiste > 0) {
          res.status(500).json({ message: 'El correo electrónico y/o nombre de usuario ya existe.Debes ingresar otro.', Status: 500 });
        } else {
          var generator = require('generate-password');
          var pass = '';
          function generatepassword() {
            pass = generator.generate({
              length: 8,
              numbers: true,
              symbols: true,
              lowercase: true,
              uppercase: true,
              strict: true,
              exclude: '_[]<>~´¬@^⌐«»°√α±÷©§'
            });
          }

          generatepassword();
          var passwordValidator = require('password-validator');
          var schema = new passwordValidator();

          schema
            .is()
            .min(8) // Minimum length 8
            .is()
            .max(100) // Maximum length 100
            .has()
            .uppercase() // Must have uppercase letters
            .has()
            .lowercase() // Must have lowercase letters
            .has()
            .digits(1) // Must have at least 2 digits
            .has()
            .symbols(1)
            .has()
            .not()
            .spaces() // Should not have spaces
            .is()
            .not()
            .oneOf(['Passw0rd', 'Password123']); // Blacklist these values

          while (schema.validate(pass) == false) {
            generatepassword();
          }

          if (schema.validate(pass) == false) {
            while (schema.validate(password) == false) {
              generatepassword();
            }
          }

          let fechaActual = moment();
          let newBody = { ...req.body, contrasena: pass, fechaAlta: fechaActual.format(), vigenciaContrasena: fechaActual.add(3, 'months').format().toString(), estatus: true };

          await schemaUserCreate.concat(schemaUser).validate({
            nombre: newBody.nombre,
            apellidoUno: newBody.apellidoUno,
            apellidoDos: newBody.apellidoDos,
            cargo: newBody.cargo,
            correoElectronico: newBody.correoElectronico,
            telefono: newBody.telefono,
            extension: newBody.extension,
            usuario: newBody.usuario,
            constrasena: pass,
            sistemas: newBody.sistemas,
            proveedorDatos: newBody.proveedorDatos,
            estatus: true,
            fechaAlta: newBody.fechaAlta,
            vigenciaContrasena: newBody.vigenciaContrasena,
            rol: '2'
          });
          if (newBody.passwordConfirmation) {
            delete newBody.passwordConfirmation;
          }

          delete newBody.constrasena;
          newBody['constrasena'] = pass;
          newBody['contrasenaNueva'] = true;
          newBody['rol'] = 2;
          if (req.body.apellidoDos == '' || req.body.apellidoDos === undefined) {
            newBody['apellidoDos'] = '';
          }

          const client = new SMTPClient({
            user: process.env.EMAIL,
            password: process.env.PASS_EMAIL,
            host: process.env.HOST_EMAIL,
            ssl: true
          });

          const message = {
            text: 'Bienvenido al Sistema de Carga de datos S2 y S3',
            from: process.env.EMAIL,
            to: newBody.correoElectronico,
            subject: 'Bienvenido al Sistema de Carga de datos S2 y S3',
            attachment: [{ data: '<html>Buen día anexamos tu contraseña nueva para acceder al portal de la PDN. Contraseña:  <br><i><b><h3>' + pass + '</h3></b></i></html>', alternative: true }]
          };
           
     
          client.send(message, function (err,mess) {
            console.log(err)
            if (err != null) {
              res.status(200).json({ message: 'Hay errores al enviar tu nueva contraseña.Ponte en contacto con el administrador.', Status: 500 });
            }
          });

          const nuevoUsuario = new User(newBody);
          let response;
          response = await nuevoUsuario.save();
          return res.status(200).json(response);
        }
      } catch (e) {
        let errorMessage = {};
        errorMessage['errores'] = e.errors;
        errorMessage['campo'] = e.path;
        errorMessage['tipoError'] = e.type;
        errorMessage['mensaje'] = e.message;
        return res.status(400).json(errorMessage);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.put('/edit/user', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      try {
        var correoexiste = await User.find({ correoElectronico: { $eq: req.body.correoElectronico }, usuario: { $ne: req.body.usuario }, fechaBaja: { $eq: null } }).countDocuments();
        if (correoexiste === undefined) {
          correoexiste = 0;
        }

        var proveedorvigente = await Provider.findById(req.body.proveedorDatos);
        let arrsistemas = [];
        for (let sistemaproveedor of proveedorvigente.sistemas) {
          for (let sistemauser of req.body.sistemas) {
            if (sistemaproveedor == sistemauser) {
              arrsistemas.push(sistemaproveedor);
            }
          }
        }

        if (correoexiste > 0) {
          res.status(500).json({ message: 'Error: El correo electrónico ya existe.', tipo: 'Error.', Status: 500 });
        } else if (proveedorvigente.fechaBaja != undefined) {
          res.status(500).json({ message: 'Error: El campo proveedor de datos es requerido.', tipo: 'Error.', Status: 500 });
        } else if (proveedorvigente.estatus == false && req.body.estatus == true) {
          res.status(500).json({ message: 'Error: El estatus del proveedor es no vigente.', tipo: 'Error.', Status: 500 });
        } else {
          let newBody = { ...req.body };
          newBody['sistemas'] = arrsistemas;
          await schemaUser.validate({
            nombre: newBody.nombre,
            apellidoUno: newBody.apellidoUno,
            apellidoDos: newBody.apellidoDos,
            cargo: newBody.cargo,
            correoElectronico: newBody.correoElectronico,
            telefono: newBody.telefono,
            extension: newBody.extension,
            usuario: newBody.usuario,
            constrasena: newBody.constrasena,
            sistemas: newBody.sistemas,
            proveedorDatos: newBody.proveedorDatos,
            estatus: newBody.estatus
          });
          if (req.body.apellidoDos == '' || req.body.apellidoDos === undefined) {
            newBody['apellidoDos'] = '';
          }

          const nuevoUsuario = new User(newBody);
          let response;
          if (req.body._id) {
            response = await User.findByIdAndUpdate(req.body._id, nuevoUsuario).exec();
            res.status(200).json(response);
          } else {
            res.status(500).json({ message: 'Error : Datos incompletos', tipo: 'Error.', Status: 500 });
          }
        }
      } catch (e) {
        let errorMessage = {};
        errorMessage['errores'] = e.errors;
        errorMessage['campo'] = e.path;
        errorMessage['tipoError'] = e.type;
        errorMessage['mensaje'] = e.message;
        res.status(400).json(errorMessage);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getUsers', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;

      const paginationResult = await User.paginate(query, { page: page, limit: pageSize, sort: sortObj, rol: '2' }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getUsersFull', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      const result = await User.find({ fechaBaja: null, rol: '2' }).then();
      let objResponse = {};
      objResponse['results'] = result;
      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

/////////////////////////////////////////////////////////SHEMA S2///////////////////////////////////////////

app.post('/insertS2Schema', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.body.usuario;
    delete req.body.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis2.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaS2 = data.components.schemas.respSpic;
      let validacion = new swaggerValidator.Handler();
      let newdocument = req.body;
      newdocument['id'] = 'FAKEID';
      newdocument['fechaCaptura'] = moment().format();
      let respuesta = await validateSchema([newdocument], schemaS2, validacion);
      if (respuesta.valid) {
        try {
          let Spic = S2.model('Spic', spicSchema, 'spic');
          delete req.body.id;
          let esquema = new Spic(req.body);
          const result = await esquema.save();
          let objResponse = {};
          var datausuario = await User.findById(usuario);

          const proveedorRegistros1 = new proveedorRegistros({ proveedorId: datausuario.proveedorDatos, registroSistemaId: result._id, sistema: 'S2' });
          var resp = await proveedorRegistros1.save();

          objResponse['results'] = result;
          var bitacora = [];
          bitacora['tipoOperacion'] = 'CREATE';
          bitacora['fechaOperacion'] = moment().format();
          bitacora['usuario'] = usuario;
          bitacora['numeroRegistros'] = 1;
          bitacora['sistema'] = 'S2';
          registroBitacora(bitacora);
          res.status(200).json(objResponse);
        } catch (e) {
          console.log(e);
        }
      } else {
        res.status(400).json({ message: 'Error in validation', Status: 400, response: respuesta });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/insertS3SSchema', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.body.usuario;
    delete req.body.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let values = req.body;

      values['fechaCaptura'] = moment().format();
      values['id'] = 'FAKEID';

      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis3s.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaResults = data.components.schemas.ssancionados.properties.results;
      schemaResults.items.properties.tipoFalta = data.components.schemas.tipoFalta;
      schemaResults.items.properties.tipoSancion = data.components.schemas.tipoSancion;

      let schemaS3S = schemaResults;
      let validacion = new swaggerValidator.Handler();
      let respuesta = await validateSchema([values], schemaS3S, validacion);
      //se insertan

      if (respuesta.valid) {
        try {
          let sancionados = S3S.model('Ssancionados', ssancionadosSchema, 'ssancionados');
          let response;
          delete values.id;
          let esquema = new sancionados(values);
          const result = await esquema.save();
          let objResponse = {};
          objResponse['results'] = result;
          var datausuario = await User.findById(usuario);
          const proveedorRegistros1 = new proveedorRegistros({ proveedorId: datausuario.proveedorDatos, registroSistemaId: result._id, sistema: 'S3S' });
          var resp = await proveedorRegistros1.save();
          var bitacora = [];
          bitacora['tipoOperacion'] = 'CREATE';
          bitacora['fechaOperacion'] = moment().format();
          bitacora['usuario'] = usuario;
          bitacora['numeroRegistros'] = 1;
          bitacora['sistema'] = 'S3S';
          registroBitacora(bitacora);
          res.status(200).json({ message: 'Se realizarón las inserciones correctamente', Status: 200, response: response, detail: objResponse });
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log(respuesta);
        res.status(400).json({ message: 'Error in validation openApi', Status: 400, response: respuesta });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

/////////////////////////////////////////////////////////SHEMA S2///////////////////////////////////////////

app.post('/insertS3PSchema', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.body.usuario;
    delete req.body.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let values = req.body;

      values['fechaCaptura'] = moment().format();
      values['id'] = 'FAKEID';

      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis3p.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaResults = data.components.schemas.resParticularesSancionados.properties.results;
      schemaResults.items.properties.particularSancionado.properties.domicilioExtranjero.properties.pais = data.components.schemas.pais;
      schemaResults.items.properties.tipoSancion = data.components.schemas.tipoSancion;
      let schemaS3P = schemaResults;

      let validacion = new swaggerValidator.Handler();
      let respuesta = await validateSchema([values], schemaS3P, validacion);
      //se insertan

      if (respuesta.valid) {
        try {
          let psancionados = S3P.model('Psancionados', psancionadosSchema, 'psancionados');
          let response;
          delete values.id;
          //   console.log(values);
          let esquema = new psancionados(values);
          const result = await esquema.save();
          let objResponse = {};
          objResponse['results'] = result;
          var datausuario = await User.findById(usuario);

          const proveedorRegistros1 = new proveedorRegistros({ proveedorId: datausuario.proveedorDatos, registroSistemaId: result._id, sistema: 'S3P' });
          var resp = await proveedorRegistros1.save();

          var bitacora = [];
          bitacora['tipoOperacion'] = 'CREATE';
          bitacora['fechaOperacion'] = moment().format();
          bitacora['usuario'] = usuario;
          bitacora['numeroRegistros'] = 1;
          bitacora['sistema'] = 'S3P';
          registroBitacora(bitacora);
          res.status(200).json({ message: 'Se realizarón las inserciones correctamente', Status: 200, response: response, detail: objResponse });
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log(respuesta);
        res.status(400).json({ message: 'Error in validation openApi', Status: 400, response: respuesta });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/listSchemaS3S', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      var usuario = await User.findById(req.body.idUser);
      var proveedorDatos = usuario.proveedorDatos;
      var sistema = 'S3S';
      const result = await proveedorRegistros.find({ sistema: sistema, proveedorId: proveedorDatos }).then();
      var arrs3s = [];
      _.map(result, row => {
        arrs3s.push(row.registroSistemaId);
      });

      let sancionados = S3S.model('Ssancionados', ssancionadosSchema, 'ssancionados');
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;
      if (!query._id) {
        if (arrs3s.length > 0) {
          query = { ...query, _id: { $in: arrs3s } };
        } else {
          query = { _id: { $in: arrs3s } };
        }
      }

      const paginationResult = await sancionados.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/listS3Spublic', async (req,res) => {
  try {

      let sancionados = S3S.model('Ssancionados', ssancionadosSchema, 'ssancionados');
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;
      // if (!query._id) {
      //   if (arrs3s.length > 0) {
      //     query = { ...query, _id: { $in: arrs3s } };
      //   } else {
      //     query = { _id: { $in: arrs3s } };
      //   }
      

      const paginationResult = await sancionados.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    
  } catch (e) {
    console.log(e);
  }
})

app.post('/listSchemaS2', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      var usuario = await User.findById(req.body.idUser);
      var proveedorDatos = usuario.proveedorDatos;
      var sistema = 'S2';

      const result = await proveedorRegistros.find({ sistema: sistema, proveedorId: proveedorDatos }).then();
      var arrs2 = [];
      _.map(result, row => {
        arrs2.push(row.registroSistemaId);
      });

      let Spic = S2.model('Spic', spicSchema, 'spic');
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;

      if (!query._id) {
        if (arrs2.length > 0) {
          query = { ...query, _id: { $in: arrs2 } };
        } else {
          query = { _id: { $in: arrs2 } };
        }
      }

      const paginationResult = await Spic.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/listS2public',async (req,res)=>{
  try{
    //var arrs2 = [];
    let Spic = S2.model('Spic', spicSchema, 'spic');
    let sortObj = req.body.sort === undefined ? {} : req.body.sort;
    let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
    let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
    let query = req.body.query === undefined ? {} : req.body.query;

        //query = { ...query, _id: { $in: arrs2 } };
      // } else {
       // query = { _id: { $in: arrs2 } };
      // }

    const paginationResult = await Spic.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
    let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
    let objresults = paginationResult.docs;
    let objResponse = {};
    objResponse['pagination'] = objpagination;
    objResponse['results'] = objresults;

    res.status(200).json(objResponse);

  }catch(e){
    console.log(e)
  }
})

app.post('/listSchemaS3P', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      var usuario = await User.findById(req.body.idUser);
      var proveedorDatos = usuario.proveedorDatos;
      var sistema = 'S3P';
      const result = await proveedorRegistros.find({ sistema: sistema, proveedorId: proveedorDatos }).then();
      var arrs3p = [];
      _.map(result, row => {
        arrs3p.push(row.registroSistemaId);
      });

      let sancionados = S3P.model('Psancionados', psancionadosSchema, 'psancionados');
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;

      if (!query._id) {
        if (arrs3p.length > 0) {
          query = { ...query, _id: { $in: arrs3p } };
        } else {
          query = { _id: { $in: arrs3p } };
        }
      }

      const paginationResult = await sancionados.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/listS3Ppublic', async (req,res) =>{
  try {
      let sancionados = S3P.model('Psancionados', psancionadosSchema, 'psancionados');
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;

      const paginationResult = await sancionados.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    
  } catch (e) {
    console.log(e);
  } 
})

app.delete('/deleteRecordS2', async (req, res) => {
  try {
    var code = validateToken(req);
    var bitacora = [];
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      if (req.body.request._id) {
        let Spic = S2.model('Spic', spicSchema, 'spic');
        let deletedRecord;
        let numRecords = 0;
        if (Array.isArray(req.body.request._id)) {
          numRecords = req.body.request._id.length;
          deletedRecord = await Spic.deleteMany({
            _id: {
              $in: req.body.request._id
            }
          })
            .catch(err => res.status(400).json({ message: err.message, code: '400' }))
            .then();
        } else {
          numRecords = 1;
          deletedRecord = await Spic.findByIdAndDelete(req.body.request._id)
            .catch(err => res.status(400).json({ message: err.message, code: '400' }))
            .then();
        }

        bitacora['tipoOperacion'] = 'DELETE';
        bitacora['fechaOperacion'] = moment().format();
        bitacora['usuario'] = req.body.request.usuario;
        bitacora['numeroRegistros'] = numRecords;
        bitacora['sistema'] = 'S2';
        registroBitacora(bitacora);
        res.status(200).json({ message: 'OK', Status: 200, response: deletedRecord, messageFront: 'Se eliminaron ' + numRecords + ' registros correctamente ' });
      } else {
        res.status(500).json({ message: 'Datos incompletos', code: '500' });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.delete('/deleteRecordS3S', async (req, res) => {
  try {
    var code = validateToken(req);
    var bitacora = [];
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      if (req.body.request._id) {
        let sancionados = S3S.model('Ssancionados', ssancionadosSchema, 'ssancionados');
        let deletedRecord;
        let numRecords = 0;
        if (Array.isArray(req.body.request._id)) {
          numRecords = req.body.request._id.length;
          deletedRecord = await sancionados
            .deleteMany({
              _id: {
                $in: req.body.request._id
              }
            })
            .catch(err => res.status(400).json({ message: err.message, code: '400' }))
            .then();
        } else {
          numRecords = 1;
          deletedRecord = await sancionados
            .findByIdAndDelete(req.body.request._id)
            .catch(err => res.status(400).json({ message: err.message, code: '400' }))
            .then();
        }

        bitacora['tipoOperacion'] = 'DELETE';
        bitacora['fechaOperacion'] = moment().format();
        bitacora['usuario'] = req.body.request.usuario;
        bitacora['numeroRegistros'] = numRecords;
        bitacora['sistema'] = 'S3S';
        registroBitacora(bitacora);
        res.status(200).json({ message: 'OK', Status: 200, response: deletedRecord, messageFront: 'Se eliminaron ' + numRecords + ' registros correctamente ' });
      } else {
        res.status(500).json({ message: 'Datos incompletos', code: '500' });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.delete('/deleteRecordS3P', async (req, res) => {
  try {
    var code = validateToken(req);
    var bitacora = [];
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      if (req.body.request._id) {
        let sancionados = S3P.model('Psancionados', psancionadosSchema, 'psancionados');
        let deletedRecord;
        let numRecords = 0;
        if (Array.isArray(req.body.request._id)) {
          numRecords = req.body.request._id.length;
          deletedRecord = await sancionados
            .deleteMany({
              _id: {
                $in: req.body.request._id
              }
            })
            .catch(err => res.status(400).json({ message: err.message, code: '400' }))
            .then();
        } else {
          numRecords = 1;
          deletedRecord = await sancionados
            .findByIdAndDelete(req.body.request._id)
            .catch(err => res.status(400).json({ message: err.message, code: '400' }))
            .then();
        }

        bitacora['tipoOperacion'] = 'DELETE';
        bitacora['fechaOperacion'] = moment().format();
        bitacora['usuario'] = req.body.request.usuario;
        bitacora['numeroRegistros'] = numRecords;
        bitacora['sistema'] = 'S3P';
        registroBitacora(bitacora);
        res.status(200).json({ message: 'OK', Status: 200, response: deletedRecord, messageFront: 'Se eliminaron ' + numRecords + ' registros correctamente ' });
      } else {
        res.status(500).json({ message: 'Datos incompletos', code: '500' });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/updateS3PSchema', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.body.usuario;
    delete req.body.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let id = req.body._id;
      delete req.body._id;
      let values = req.body;
      values['fechaCaptura'] = moment().format();
      values['id'] = 'FAKEID';

      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis3p.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaResults = data.components.schemas.resParticularesSancionados.properties.results;
      schemaResults.items.properties.particularSancionado.properties.domicilioExtranjero.properties.pais = data.components.schemas.pais;
      schemaResults.items.properties.tipoSancion = data.components.schemas.tipoSancion;
      let schemaS3P = schemaResults;

      let validacion = new swaggerValidator.Handler();
      let respuesta = await validateSchema([values], schemaS3P, validacion);
      //se insertan

      if (respuesta.valid) {
        try {
          values['_id'] = id;
          let psancionados = S3P.model('Psancionados', psancionadosSchema, 'psancionados');
          let esquema = new psancionados(values);
          let response;
          if (values._id) {
            await psancionados.findByIdAndDelete(values._id);
            response = await psancionados
              .findByIdAndUpdate(values._id, esquema, {
                upsert: true,
                new: true
              })
              .exec();
            let objResponse = {};
            objResponse['results'] = response;
            var bitacora = [];
            bitacora['tipoOperacion'] = 'UPDATE';
            bitacora['fechaOperacion'] = moment().format();
            bitacora['usuario'] = usuario;
            bitacora['numeroRegistros'] = 1;
            bitacora['sistema'] = 'S3P';
            registroBitacora(bitacora);
            res.status(200).json(response);
          } else {
            res.status(500).json({ message: 'Error : Datos incompletos', Status: 500 });
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log(respuesta);
        res.status(400).json({ message: 'Error in validation openApi', Status: 400, response: respuesta });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/updateS3SSchema', async (req, res) => {
  try {
    var code = validateToken(req);
    var usuario = req.body.usuario;
    delete req.body.usuario;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let id = req.body._id;
      delete req.body._id;
      let values = req.body;
      values['fechaCaptura'] = moment().format();
      values['id'] = 'FAKEID';

      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis3s.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaResults = data.components.schemas.ssancionados.properties.results;
      schemaResults.items.properties.tipoFalta = data.components.schemas.tipoFalta;
      schemaResults.items.properties.tipoSancion = data.components.schemas.tipoSancion;

      let schemaS3S = schemaResults;
      let validacion = new swaggerValidator.Handler();
      let respuesta = await validateSchema([values], schemaS3S, validacion);
      //se insertan

      if (respuesta.valid) {
        try {
          values['_id'] = id;
          let sancionados = S3S.model('Ssancionados', ssancionadosSchema, 'ssancionados');
          let esquema = new sancionados(values);
          let response;
          if (values._id) {
            await sancionados.findByIdAndDelete(values._id);
            response = await sancionados
              .findByIdAndUpdate(values._id, esquema, {
                upsert: true,
                new: true
              })
              .exec();
            let objResponse = {};
            objResponse['results'] = response;
            var bitacora = [];
            bitacora['tipoOperacion'] = 'UPDATE';
            bitacora['fechaOperacion'] = moment().format();
            bitacora['usuario'] = usuario;
            bitacora['numeroRegistros'] = 1;
            bitacora['sistema'] = 'S3S';
            registroBitacora(bitacora);
            res.status(200).json(response);
          } else {
            res.status(500).json({ message: 'Error : Datos incompletos', Status: 500 });
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log(respuesta);
        res.status(400).json({ message: 'Error in validation openApi', Status: 400, response: respuesta });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/updateS2Schema', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', validateSchmessage: code.message });
    } else if (code.code == 200) {
      let docSend = {};
      let values = req.body;
      try {
        await esquemaS2.validate(values);
      } catch (e) {
        let errorMessage = {};
        errorMessage['errores'] = e.errors;
        errorMessage['campo'] = e.path;
        errorMessage['tipoError'] = e.type;
        errorMessage['mensaje'] = e.message;
        res.status(400).json(errorMessage);
      }

      docSend['id'] = values._id;
      docSend['fechaCaptura'] = moment().format();

      if (values.rfc) {
        docSend['rfc'] = values.rfc;
      }
      if (values.curp) {
        docSend['curp'] = values.curp;
      }
      if (values.ejercicioFiscal) {
        docSend['ejercicioFiscal'] = values.ejercicioFiscal;
      }
      if (values.ramo) {
        let ramoObj = JSON.parse(values.ramo);
        docSend['ramo'] = { clave: parseInt(ramoObj.clave), valor: ramoObj.valor };
      }
      if (values.nombres) {
        docSend['nombres'] = values.nombres;
      }
      if (values.primerApellido) {
        docSend['primerApellido'] = values.primerApellido;
      }
      if (values.segundoApellido) {
        docSend['segundoApellido'] = values.segundoApellido;
      }
      if (values.genero) {
        docSend['genero'] = JSON.parse(values.genero);
      }

      let ObjInstitucionDepe = {};
      if (values.idnombre) {
        ObjInstitucionDepe = { ...ObjInstitucionDepe, nombre: values.idnombre };
      }
      if (values.idclave) {
        ObjInstitucionDepe = { ...ObjInstitucionDepe, clave: values.idclave };
      }
      if (values.idsiglas) {
        ObjInstitucionDepe = { ...ObjInstitucionDepe, siglas: values.idsiglas };
      }
      docSend['institucionDependencia'] = ObjInstitucionDepe;

      let objPuesto = {};
      if (values.puestoNombre) {
        objPuesto = { ...objPuesto, nombre: values.puestoNombre };
      }
      if (values.puestoNivel) {
        objPuesto = { ...objPuesto, nivel: values.puestoNivel };
      }
      docSend['puesto'] = objPuesto;

      if (values.tipoArea && values.tipoArea.length > 0) {
        docSend['tipoArea'] = JSON.parse('[' + values.tipoArea + ']');
      }
      if (values.tipoProcedimiento && values.tipoProcedimiento.length > 0) {
        let ObjTipoProcedimiento = JSON.parse('[' + values.tipoProcedimiento + ']');
        docSend['tipoProcedimiento'] = getArrayFormatTipoProcedimiento(ObjTipoProcedimiento);
      }
      if (values.nivelResponsabilidad && values.nivelResponsabilidad.length > 0) {
        docSend['nivelResponsabilidad'] = JSON.parse('[' + values.nivelResponsabilidad + ']');
      }

      let objSuperiorInmediato = {};
      if (values.siRfc) {
        objSuperiorInmediato = { ...objSuperiorInmediato, rfc: values.siRfc };
      }
      if (values.siCurp) {
        objSuperiorInmediato = { ...objSuperiorInmediato, curp: values.siCurp };
      }
      if (values.sinombres) {
        objSuperiorInmediato = { ...objSuperiorInmediato, nombres: values.sinombres };
      }
      if (values.siPrimerApellido) {
        objSuperiorInmediato = { ...objSuperiorInmediato, primerApellido: values.siPrimerApellido };
      }
      if (values.siSegundoApellido) {
        objSuperiorInmediato = { ...objSuperiorInmediato, segundoApellido: values.siSegundoApellido };
      }
      let puestoObj = {};
      if (values.siPuestoNombre) {
        puestoObj = { ...puestoObj, nombre: values.siPuestoNombre };
      }
      if (values.siPuestoNivel) {
        puestoObj = { ...puestoObj, nivel: values.siPuestoNivel };
      }
      if (values.siPuestoNombre || values.siPuestoNivel) {
        objSuperiorInmediato = { ...objSuperiorInmediato, puesto: puestoObj };
      }

      docSend['superiorInmediato'] = objSuperiorInmediato;

      if (values.observaciones) {
        docSend['observaciones'] = values.observaciones;
      }
      //console.log("ya paso la validacion  "+ JSON.stringify(docSend));

      let fileContents = fs.readFileSync(path.resolve(__dirname, '../resource/openapis2.yaml'), 'utf8');
      let data = yaml.safeLoad(fileContents);
      let schemaS2 = data.components.schemas.respSpic;
      let validacion = new swaggerValidator.Handler();
      let newdocument = docSend;
      let respuesta = await validateSchema([newdocument], schemaS2, validacion);
      if (respuesta.valid) {
        try {
          docSend['_id'] = values._id;
          let Spic = S2.model('Spic', spicSchema, 'spic');
          let esquema = new Spic(docSend);
          let response;
          if (req.body._id) {
            await Spic.findByIdAndDelete(values._id);
            response = await Spic.findByIdAndUpdate(values._id, esquema, { upsert: true, new: true }).exec();
            var bitacora = [];
            bitacora['tipoOperacion'] = 'UPDATE';
            bitacora['fechaOperacion'] = moment().format();
            bitacora['usuario'] = req.body.usuario;
            bitacora['numeroRegistros'] = 1;
            bitacora['sistema'] = 'S2';
            registroBitacora(bitacora);
            res.status(200).json(response);
          } else {
            res.status(500).json({ message: 'Error : Datos incompletos', Status: 500 });
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log(respuesta);
        res.status(400).json({ message: 'Error in validation openApi', Status: 400, response: respuesta });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getProviders', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;
      console.log({ page: page, limit: pageSize, sort: sortObj });
      const paginationResult = await Provider.paginate(query, { page: page, limit: pageSize, sort: sortObj }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult.docs;

      let objResponse = {};
      objResponse['pagination'] = objpagination;
      objResponse['results'] = objresults;

      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getProvidersFull', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let result = [];
      if (req.body.all == true) {
        result = await Provider.find().then();
      } else {
        result = await Provider.find({ fechaBaja: null }).then();
      }

      let objResponse = {};

      try {
        var strippedRows = _.map(result, function (row) {
          let rowExtend = _.extend({ label: row.dependencia, value: row._id }, row.toObject());
          return rowExtend;
        });
      } catch (e) {
        console.log(e);
      }

      console.log({ page: 'pages', limit: 'pageSize', sort: 'sortObj' });
      objResponse['results'] = strippedRows;
      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getUsersAll', async (req, res) => {
  try {
    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      const result = await User.find({ rol: '2' });
      let objResponse = {};

      try {
        var strippedRows = _.map(result, function (row) {
          if (row.apellidoDos === undefined) {
            let rowExtend = _.extend({ label: row.nombre + ' ' + row.apellidoUno, value: row._id }, row.toObject());
            return rowExtend;
          } else {
            let rowExtend = _.extend({ label: row.nombre + ' ' + row.apellidoUno + ' ' + row.apellidoDos, value: row._id }, row.toObject());
            return rowExtend;
          }
        });
      } catch (e) {
        console.log(e);
      }
      objResponse['results'] = strippedRows;
      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getCatalogs', async (req, res) => {
  try {
    var code = validateToken(req);
    let docType = req.body.docType;
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      const result = await Catalog.find({ docType: docType }).sort({ valor: 'ascending' }).then();
      let objResponse = {};
      let strippedRows;
      if (
        docType === 'genero' ||
        docType === 'ramo' ||
        docType === 'tipoArea' ||
        docType === 'nivelResponsabilidad' ||
        docType === 'tipoProcedimiento' ||
        docType === 'tipoFalta' ||
        docType === 'tipoSancion' ||
        docType === 'moneda' ||
        docType === 'tipoDocumento' ||
        docType === 'tipoPersona' ||
        docType === 'pais' ||
        docType === 'estado' ||
        docType === 'municipio' ||
        docType === 'vialidad' ||
        docType === 'tipoSancionS3P'
      ) {
        try {
          strippedRows = _.map(result, function (row) {
            let rowExtend = _.extend({ label: row.valor, value: JSON.stringify({ clave: row.clave, valor: row.valor }) }, row.toObject());
            return rowExtend;
          });
        } catch (e) {
          console.log(e);
        }
      } else if (docType === 'puesto') {
        try {
          strippedRows = _.map(result, function (row) {
            let rowExtend = _.extend({ label: row.nombre, value: row.nivel }, row.toObject());
            return rowExtend;
          });
        } catch (e) {
          console.log(e);
        }
      }

      objResponse['results'] = strippedRows;
      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getCatalogsMunicipiosPorEstado', async (req, res) => {
  try {
    var code = validateToken(req);
    let docType = 'municipio';
    let idEstado = req.body.idEstado;
    let objEstado;
    try {
      objEstado = JSON.parse(idEstado);
    } catch (e) {
      console.log(e);
    }
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      console.log({ docType: docType, cve_ent: objEstado.clave });
      const result = await Catalog.find({ docType: docType, cve_ent: objEstado.clave }).sort({ valor: 'ascending' }).then();
      let objResponse = {};
      let strippedRows;

      try {
        strippedRows = _.map(result, function (row) {
          let rowExtend = _.extend({ label: row.valor, value: JSON.stringify({ clave: row.clave, valor: row.valor }) }, row.toObject());
          return rowExtend;
        });
      } catch (e) {
        console.log(e);
      }

      objResponse['results'] = strippedRows;
      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getCatalogsLocalidadesPorEstado', async (req, res) => {
  try {
    var code = validateToken(req);
    let docType = 'localidad';
    let idMunicipio = req.body.idMunicipio;
    let idEntidad = req.body.idEntidad;
    let objMunicipio;
    let objEntidad;
    try {
      objMunicipio = JSON.parse(idMunicipio);
      objEntidad = JSON.parse(idEntidad);
    } catch (e) {
      console.log(e);
    }
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      console.log({ docType: docType, cve_mun: objMunicipio.clave, cve_ent: objEntidad.clave });
      const result = await Catalog.find({ docType: docType, cve_mun: objMunicipio.clave, cve_ent: objEntidad.clave }).sort({ valor: 'ascending' }).then();
      let objResponse = {};
      let strippedRows;

      try {
        strippedRows = _.map(result, function (row) {
          let rowExtend = _.extend({ label: row.valor, value: JSON.stringify({ clave: row.clave, valor: row.valor }) }, row.toObject());
          return rowExtend;
        });
      } catch (e) {
        console.log(e);
      }

      objResponse['results'] = strippedRows;
      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/getBitacora', async (req, res) => {
  try {
    function horaActual(horaAct) {
      var zona = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
      var hora = new Date(horaAct - zona).toISOString().slice(0, -5);
      return hora;
    }

    function toIsoString(date) {
      var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
          var norm = Math.floor(Math.abs(num));
          return (norm < 10 ? '0' : '') + norm;
        };

      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()) + dif + pad(tzo / 60) + ':' + pad(tzo % 60);
    }

    var fechaInicial = new Date(req.body.fechaInicial);
    fechaInicial = toIsoString(fechaInicial);

    var fechaFinal = new Date(req.body.fechaFinal);
    fechaFinal = toIsoString(fechaFinal);

    let objResponse = {};
    let strippedRows;

    if (fechaInicial == '' || fechaFinal == '') {
      res.status(500).json({ message: 'Error : Datos incompletos', Status: 500 });
    }

    var code = validateToken(req);
    if (code.code == 401) {
      res.status(401).json({ code: '401', message: code.message });
    } else if (code.code == 200) {
      let sortObj = req.body.sort === undefined ? {} : req.body.sort;
      let page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar
      let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
      let query = req.body.query === undefined ? {} : req.body.query;

      if (typeof req.body.sistema != 'undefined' && typeof req.body.usuarioBitacora != 'undefined') {
        var paginationResult = await Bitacora.aggregate([
          {
            $lookup: {
              from: 'usuarios',
              localField: 'usuario',
              foreignField: '_id',
              as: 'Data'
            }
          },
          {
            $match: {
              fechaOperacion: { $gte: fechaInicial, $lte: fechaFinal },
              sistema: { $in: req.body.sistema }
            }
          }
        ]);

        var us = await User.findById(req.body.usuarioBitacora);
        var arrusuarios = [];
        _.map(paginationResult, function (item) {
          if (item.usuario == req.body.usuarioBitacora) {
            arrusuarios.push({ tipoOperacion: item.tipoOperacion, fechaOperacion: item.fechaOperacion, sistema: item.sistema, numeroRegistros: item.numeroRegistros, idUsuario: item.usuario, Data: [{ usuario: us.usuario }] });
          }
        });
        paginationResult = arrusuarios;
      } else if (typeof req.body.sistema != 'undefined') {
        var paginationResult = await Bitacora.aggregate([
          {
            $lookup: {
              from: 'usuarios',
              localField: 'usuario',
              foreignField: '_id',
              as: 'Data'
            }
          },
          {
            $match: {
              fechaOperacion: { $gte: fechaInicial, $lte: fechaFinal },
              sistema: { $in: req.body.sistema }
            }
          }
        ]);
      } else if (typeof req.body.usuarioBitacora != 'undefined') {
        var paginationResult = await Bitacora.find({ fechaOperacion: { $gte: fechaInicial, $lte: fechaFinal } });
        var us = await User.findById(req.body.usuarioBitacora);
        var arrusuarios = [];
        _.map(paginationResult, function (item) {
          if (item.usuario == req.body.usuarioBitacora) {
            arrusuarios.push({ tipoOperacion: item.tipoOperacion, fechaOperacion: item.fechaOperacion, sistema: item.sistema, numeroRegistros: item.numeroRegistros, idUsuario: item.usuario, Data: [{ usuario: us.usuario }] });
          }
        });
        paginationResult = arrusuarios;
      } else {
        var paginationResult = await Bitacora.aggregate([
          {
            $lookup: {
              from: 'usuarios',
              localField: 'usuario',
              foreignField: '_id',
              as: 'Data'
            }
          },
          {
            $match: { fechaOperacion: { $gte: fechaInicial, $lte: fechaFinal } }
          }
        ]);
      }

      formato(paginationResult);

      function formato(paginationResult) {
        moment.locale('es');
        strippedRows = _.map(paginationResult, function (row) {
          var fecha = moment(row.fechaOperacion).tz('America/Mexico_City').format('LLLL');
          var sistema = row.sistema;
          var sistema_label = '';
          var tipoOperacion = row.tipoOperacion;
          var tipo = '';

          if (sistema == 'S2') {
            sistema_label = 'Sistema de Servidores Públicos que Intervienen en Procedimientos de Contratación.';
          }
          if (sistema == 'S3S') {
            sistema_label = 'Sistema de los Servidores Públicos Sancionados.';
          }
          if (sistema == 'S3P') {
            sistema_label = 'Sistema de los Particulares Sancionados.';
          }
          if (tipoOperacion == 'CREATE') {
            tipo = 'Alta';
          }
          if (tipoOperacion == 'DELETE') {
            tipo = 'Eliminación';
          }
          if (tipoOperacion == 'UPDATE') {
            tipo = 'Actualización';
          }
          if (tipoOperacion == 'READ') {
            tipo = 'Consulta';
          }

          var nombre_usuario = '';
          _.map(row.Data, function (item) {
            nombre_usuario = item.usuario;
          });

          let rowExtend = _.extend({ fecha: fecha, tipo: tipo, sistema_label: sistema_label, numeroRegistros: row.numeroRegistros, nombre: nombre_usuario });
          return rowExtend;
        });

        paginationResult['resultado'] = strippedRows;
      }

      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs };
      let objresults = paginationResult;
      let objResponse = {};
      //objResponse["pagination"] = objpagination;
      objResponse['results'] = paginationResult['resultado'];

      res.status(200).json(objResponse);
    }
  } catch (e) {
    console.log(e);
  }
});

app.post('/resetpassword', async (req, res) => {
  try {
    let correo = req.body.correo;
    const correoValidar = Yup.string().email().required();
    const validacion = await correoValidar.isValid(correo);

    if (validacion == false) {
      res.status(200).json({ message: 'Correo electrónico inválido.', Status: 500 });
      return false;
    }

    const estatus = await User.find({ correoElectronico: correo, estatus: false }).then();

    if (estatus.length > 0) {
      res.status(200).json({ message: 'El usuario está dado de baja en el sistema.', Status: 500 });
      return false;
    }

    const result = await User.find({ correoElectronico: correo }).then();

    if (result.length == 0) {
      res.status(200).json({ message: 'El Correo electrónico que ingresaste no existe.', Status: 500 });
      return false;
    }

    var generator = require('generate-password');

    var password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      lowercase: true,
      uppercase: true,
      strict: true,
      exclude: '_[]<>~´¬@^⌐«»°√α±÷©§'
    });

    const client = new SMTPClient({
      user: process.env.EMAIL,
      password: process.env.PASS_EMAIL,
      host: process.env.HOST_EMAIL,
      ssl: true
    });

    const message = {
      text: ' Bienvenido al Sistema de Carga de datos S2 y S3',
      from: process.env.EMAIL,
      to: correo,
      subject: ' Bienvenido al Sistema de Carga de datos S2 y S3',
      attachment: [{ data: '<html>Buen día anexamos tu contraseña nueva para acceder al portal de la PDN. Contraseña:  <br><i><b><h3>' + password + '</h3></b></i></html>', alternative: true }]
    };

    // send the message and get a callback with an error or details of the message that was sent
    client.send(message, function (err, message) {
      if (err != null) {
        res.status(200).json({ message: 'Hay errores al enviar tu nueva contraseña.Ponte en contacto con el administrador.', Status: 500 });
      }
    });
    let fechaActual = moment();

    const respuesta = await User.updateOne({ correoElectronico: correo }, { constrasena: password, contrasenaNueva: true, vigenciaContrasena: fechaActual.add(3, 'months').format().toString() });
    res.status(200).json({ message: 'Se ha enviado tu nueva contraseña al correo electrónico proporcionado.', Status: 200 });
  } catch (e) {
    console.log(e);
  }
});

app.post('/changepassword', async (req, res) => {
  try {
    let constrasena = req.body.constrasena;
    let passwordConfirmation = req.body.passwordConfirmation;
    let id = req.body.user;

    if (constrasena != passwordConfirmation) {
      res.status(200).json({ message: 'Las contraseñas no coinciden.', Status: 500 });
      return false;
    }
    let fechaActual = moment();

    const result = await User.update({ _id: id }, { constrasena: constrasena, contrasenaNueva: false, vigenciaContrasena: fechaActual.add(3, 'months').format().toString() }).then();
    res.status(200).json({ message: '¡Se ha actualizado tu contraseña!.', Status: 200 });
  } catch (e) {
    console.log(e);
  }
});

app.post('/validationpassword', async (req, res) => {
  var code = validateToken(req);
  if (code.code == 401) {
    res.status(401).json({ code: '401', message: code.message });
  } else if (code.code == 200) {
    try {
      let id_usuario = req.body.id_usuario;
      console.log(id_usuario)
      if (id_usuario == '') {
        res.status(200).json({ message: 'Id Usuario requerido.', Status: 500 });
        return false;
      }
      const result = await User.findById(id_usuario).exec();
      console.log(result)
      if (result.contrasenaNueva === true) {
        res.status(200).json({ message: 'Necesitas cambiar tu contraseña', Status: 500, contrasenaNueva: true, rol: result.rol, sistemas: result.sistemas, proveedor: result.proveedorDatos, estatus: result.estatus });
      } else {
        res.status(200).json({ message: 'Tu contraseña está al día.', Status: 200, contrasenaNueva: false, rol: result.rol, sistemas: result.sistemas, proveedor: result.proveedorDatos, estatus: result.estatus });
      }
    } catch (e) {
      console.log(e);
    }
  }
});
