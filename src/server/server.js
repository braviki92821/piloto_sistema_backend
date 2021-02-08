import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import * as Yup from 'yup';
import User from './schemas/model.user';
import {spicSchema} from './schemas/model.s2';
import Provider from './schemas/model.proovedor';
import Catalog from './schemas/model.catalog';
import moment from "moment";
const mongoose = require('mongoose');
const yaml = require('js-yaml')
const fs = require('fs');
const SwaggerClient = require('swagger-client');
var Validator = require('swagger-model-validator');
var validator = new Validator(SwaggerClient);
var swaggerValidator = require('swagger-object-validator');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
import regeneratorRuntime from "regenerator-runtime";
import * as Console from "console";


//connection mongo db
console.log('mongodb://'+process.env.USERMONGO+':'+process.env.PASSWORDMONGO+'@'+process.env.HOSTMONGO+'/'+process.env.DATABASE);
const db = mongoose.connect('mongodb://'+process.env.USERMONGO+':'+process.env.PASSWORDMONGO+'@'+process.env.HOSTMONGO+'/'+process.env.DATABASE, { useNewUrlParser: true,  useUnifiedTopology: true  })
    .then(() => console.log('Connect to MongoDB..'))
    .catch(err => console.error('Could not connect to MongoDB..', err))

mongoose.set('useFindAndModify', false);

let S2 = mongoose.connection.useDb("S2");
//let port = process.env.PORT || 7777;
let app = express();
app.use(
    cors(),
    bodyParser.urlencoded({extended:true}),
    bodyParser.json()
);


let server = app.listen(3004, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log(' function cloud Server is listening at http://%s:%s', host, port);
});


var validateToken = function(req){
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
        var decoded =  jwt.verify(inToken, process.env.SEED );
        return {code: 200, message: decoded};
    } catch(err) {
        // err
        let error="" ;
        if (err.message === "jwt must be provided"){
            error = "Error el token de autenticación (JWT) es requerido en el header, favor de verificar"
        }else if(err.message === "invalid signature" || err.message.includes("Unexpected token")){
            error = "Error token inválido, el token probablemente ha sido modificado favor de verificar"
        }else if (err.message ==="jwt expired"){
            error = "Error el token de autenticación (JWT) ha expirado, favor de enviar uno válido "
        }else {
            error = err.message;
        }

        let obj = {code: 401, message: error};
        return obj;
    }
}

const schemaUserCreate = Yup.object().shape({
    vigenciaContrasena:  Yup.string().required(),
    fechaAlta:  Yup.string().required(),
});

const schemaUser = Yup.object().shape({
    nombre: Yup.string().matches(new RegExp("^['A-zÀ-ú ]*$"),'no se permiten números, ni cadenas vacias' ).required().trim(),
    apellidoUno: Yup.string().matches(new RegExp('^[\'A-zÀ-ú ]*$'),'no se permiten números, ni cadenas vacias' ).required().trim(),
    apellidoDos: Yup.string().matches(new RegExp('^[\'A-zÀ-ú ]*$'),'no se permiten números, ni cadenas vacias' ).required().trim(),
    cargo: Yup.string().matches(new RegExp('^[\'A-zÀ-ú ]*$'),'no se permiten números, ni cadenas vacias' ).required().trim(),
    correoElectronico: Yup.string().required().email(),
    telefono:  Yup.string().matches(new RegExp('^[0-9]{10}$'), 'Inserta un número de teléfono valido, 10 caracteres').required().trim(),
    extension: Yup.string().matches(new RegExp('^[0-9]{0,10}$'), 'Inserta un número de extensión valido , maximo 10 caracteres').required().trim(),
    usuario: Yup.string().matches(new RegExp('^[a-zA-Z0-9]{8,}$'),'Inserta al menos 8 caracteres, no se permiten caracteres especiales' ).required().trim(),
    constrasena: Yup.string().matches(new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*()_+,.\\\\\\/;\':"-]).{8,}$'),'Inserta al menos 8 caracteres, al menos un número, almenos un caracter especial ' ).required().trim(),
    sistemas: Yup.array().min(1).required(),
    proveedorDatos: Yup.string().required(),
    estatus: Yup.boolean().required()
});



const schemaProvider = Yup.object().shape({
    dependencia:  Yup.string().required().matches(new RegExp('^[ñáéíóúáéíóúÁÉÍÓÚa-zA-Z ]*$'), 'Inserta solamente caracteres'),
    sistemas: Yup.array().min(1).required(),
    estatus: Yup.boolean().required(),
    fechaAlta: Yup.string(),
});

async function validateSchema(doc,schema,validacion){
     let result =  await validacion.validateModel(doc, schema);
     if(result){
        let objError={};
        let arrayErrors = result.errorsWithStringTypes();
        let textErrors;
        objError["docId"]= doc.id;
        objError["valid"] =  arrayErrors.length === 0 ? true : false;
        objError["errorCount"]= arrayErrors.length;

        let errors= [];
        for(let error of arrayErrors){
            let obj={};
            obj["typeError"]= error.errorType;
            let path = "";
            for(let ruta of error.trace){
                path = path+ ruta.stepName + "/";
            }
            obj["pathError"]= path;
            errors.push(obj);
        }
        objError["errors"]= errors;
        objError["errorsHumanReadable"]= result.humanReadable();
        return objError;
    }
}

app.post('/validateSchemaS2',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let fileContents = fs.readFileSync( path.resolve(__dirname, '../src/resource/openapis2.yaml'), 'utf8');
            let data = yaml.safeLoad(fileContents);
            let schemaS2 =  data.components.schemas.respSpic;
            let validacion = new swaggerValidator.Handler();

            let newdocument = req.body;
            let respuesta=[];
            if(Array.isArray(newdocument)){
                for (let doc of newdocument){
                    respuesta.push(await validateSchema([doc],schemaS2,validacion));
                }
            }else{
                respuesta.push(await validateSchema([newdocument],schemaS2,validacion));
            }
            res.status(200).json(respuesta);
        }
    }catch (e) {
        console.log(e);
    }
});

app.delete('/deleteUser',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            if(req.body.request._id){
                let fechabaja = moment().format();
                let response = await User.findByIdAndUpdate( req.body.request._id , {$set: {fechaBaja : fechabaja}} ).exec();
                res.status(200).json({message : "OK" , Status : 200, response : response} );
            }else{
                res.status(500).json([{"Error":"Datos incompletos"}]);
            }
        }
    }catch (e) {
        console.log(e);
    }

});

app.delete('/deleteProvider',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){

            if(req.body.request._id){
                let fechabaja = moment().format();
                let response = await Provider.findByIdAndUpdate( req.body.request._id , {$set: {fechaBaja : fechabaja}} ).exec();
                res.status(200).json({message : "OK" , Status : 200, response : response});
            }
        }
    }catch (e) {
        console.log(e);
    }

});

app.post('/create/provider',async(req, res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ) {

            try {
                await schemaProvider.validate({
                    dependencia: req.body.dependencia,
                    sistemas : req.body.sistemas,
                    estatus : req.body.estatus,
                    fechaAlta: req.body.fechaAlta
                });

                const nuevoProovedor = new Provider(req.body);
                let responce;
                responce = await nuevoProovedor.save();
                res.status(200).json(responce);
            }catch (e) {
                let errorMessage = {};
                errorMessage["errores"] = e.errors;
                errorMessage["campo"]= e.path;
                errorMessage["tipoError"] = e.type;
                errorMessage["mensaje"] = e.message;
                res.status(400).json(errorMessage);
            }

        }
    }catch (e){
        console.log(e);
    }
});


app.put('/edit/provider',async(req, res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ) {
            try {
                await Yup.object().shape({ fechaActualizacion: Yup.string().required(),}).concat(schemaProvider).validate({
                    dependencia: req.body.dependencia,
                    sistemas: req.body.sistemas,
                    estatus: req.body.estatus,
                    fechaAlta: req.body.fechaAlta,
                    fechaActualizacion: req.body.fechaActualizacion
                });

                const nuevoProovedor = new Provider(req.body);
                let responce;

                if (req.body._id ) {
                    responce = await Provider.findByIdAndUpdate(req.body._id, nuevoProovedor).exec();
                    res.status(200).json(responce);
                } else {
                    res.status(500).json({message : "Error : Datos incompletos" , Status : 500});
                }

            }catch (e) {
                let errorMessage = {};
                errorMessage["errores"] = e.errors;
                errorMessage["campo"]= e.path;
                errorMessage["tipoError"] = e.type;
                errorMessage["mensaje"] = e.message;
                res.status(400).json(errorMessage);
            }
        }
    }catch (e){
        console.log(e);
    }
});


app.post('/create/user',async (req,res)=>{
    try {

        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){

            try {


              await schemaUserCreate.concat(schemaUser).validate({ nombre : req.body.nombre,
                    apellidoUno : req.body.apellidoUno,
                    apellidoDos : req.body.apellidoDos,
                    cargo : req.body.cargo,
                    correoElectronico : req.body.correoElectronico,
                    telefono : req.body.telefono,
                    extension : req.body.extension,
                    usuario : req.body.usuario,
                    constrasena : req.body.constrasena,
                    sistemas : req.body.sistemas,
                    proveedorDatos : req.body.proveedorDatos,
                    estatus : req.body.estatus,
                    fechaAlta:req.body.fechaAlta,
                    vigenciaContrasena: req.body.vigenciaContrasena
              });

                  const nuevoUsuario = new User(req.body);
                  let response;
                  response = await nuevoUsuario.save();
                  res.status(200).json(response);

            }catch (e) {
                let errorMessage = {};
                errorMessage["errores"] = e.errors;
                errorMessage["campo"]= e.path;
                errorMessage["tipoError"] = e.type;
                errorMessage["mensaje"] = e.message;
                res.status(400).json(errorMessage);
            }
        }
    }catch (e) {
        console.log(e);
    }
});


app.put('/edit/user',async (req,res)=>{
    try {
        console.log(req.body);
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            try{
                await schemaUser.validate({ nombre : req.body.nombre,
                    apellidoUno : req.body.apellidoUno,
                    apellidoDos : req.body.apellidoDos,
                    cargo : req.body.cargo,
                    correoElectronico : req.body.correoElectronico,
                    telefono : req.body.telefono,
                    extension : req.body.extension,
                    usuario : req.body.usuario,
                    constrasena : req.body.constrasena,
                    sistemas : req.body.sistemas,
                    proveedorDatos : req.body.proveedorDatos,
                    estatus : req.body.estatus });

                const nuevoUsuario = new User(req.body);
                let response;
                if(req.body._id ){
                    response = await User.findByIdAndUpdate( req.body._id ,nuevoUsuario).exec();
                    res.status(200).json(response);
                }else{
                    res.status(500).json({message : "Error : Datos incompletos" , Status : 500});
                }
            }catch (e) {
                let errorMessage = {};
                errorMessage["errores"] = e.errors;
                errorMessage["campo"]= e.path;
                errorMessage["tipoError"] = e.type;
                errorMessage["mensaje"] = e.message;
                res.status(400).json(errorMessage);
            }
        }
    }catch (e) {
        console.log(e);
    }
});


app.post('/getUsers',async (req,res)=>{
    try {

        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let sortObj = req.body.sort  === undefined ? {} : req.body.sort;
            let page = req.body.page === undefined ? 1 : req.body.page ;  //numero de pagina a mostrar
            let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
            let query = req.body.query === undefined ? {} : req.body.query;

            const paginationResult = await User.paginate(query, {page :page , limit: pageSize, sort: sortObj}).then();
            let objpagination ={hasNextPage : paginationResult.hasNextPage, page:paginationResult.page, pageSize : paginationResult.limit, totalRows: paginationResult.totalDocs }
            let objresults = paginationResult.docs;

            let objResponse= {};
            objResponse["pagination"] = objpagination;
            objResponse["results"]= objresults;

            res.status(200).json(objResponse);
        }
    }catch (e) {
        console.log(e);
    }

});


app.post('/getUsersFull',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            const result = await User.find({fechaBaja: null}).then();
            let objResponse= {};
            objResponse["results"]= result;
            res.status(200).json(objResponse);
        }
    }catch (e) {
        console.log(e);
    }
});

/////////////////////////////////////////////////////////SHEMA S2///////////////////////////////////////////

app.post('/insertS2Schema',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let fileContents = fs.readFileSync( path.resolve(__dirname, '../src/resource/openapis2.yaml'), 'utf8');
            let data = yaml.safeLoad(fileContents);
            let schemaS2 =  data.components.schemas.respSpic;
            let validacion = new swaggerValidator.Handler();
            let newdocument = req.body;
            let respuesta = await validateSchema([newdocument],schemaS2,validacion);
            if(respuesta.valid) {
                try {
                    let Spic = S2.model('Spic',spicSchema, 'spic');
                    delete req.body.id;
                    console.log("bodyy "+req.body);
                    let esquema= new Spic(req.body);
                    const result = await esquema.save();
                    let objResponse= {};

                    objResponse["results"]= result;
                    console.log(objResponse);
                    res.status(200).json(objResponse);
                }catch (e) {
                    console.log(e);
                }
            }else{
                console.log(respuesta);
                res.status(400).json({message : "Error in validation" , Status : 400, response : respuesta});
            }
        }
    }catch (e) {
        console.log(e);
    }
});

app.post('/listSchemaS2',async (req,res)=> {
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let Spic = S2.model('Spic',spicSchema, 'spic');
            let sortObj = req.body.sort  === undefined ? {} : req.body.sort;
            let page = req.body.page === undefined ? 1 : req.body.page ;  //numero de pagina a mostrar
            let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
            let query = req.body.query === undefined ? {} : req.body.query;
            console.log({page :page , limit: pageSize, sort: sortObj});
            const paginationResult = await Spic.paginate(query, {page :page , limit: pageSize, sort: sortObj}).then();
            let objpagination ={hasNextPage : paginationResult.hasNextPage, page:paginationResult.page, pageSize : paginationResult.limit, totalRows: paginationResult.totalDocs }
            let objresults = paginationResult.docs;

            let objResponse= {};
            objResponse["pagination"] = objpagination;
            objResponse["results"]= objresults;

            res.status(200).json(objResponse);
        }
    }catch (e) {

    }
});


app.delete('/deleteRecordS2',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            if(req.body.request._id){
                let Spic = S2.model('Spic',spicSchema, 'spic');
               const deletedRecord =  await Spic
                   .findByIdAndDelete( req.body.request._id)
                   .catch(err => res.status(400).json({message : err.message , code: '400'})).then();

                res.status(200).json({message : "OK" , Status : 200, response : deletedRecord} );
            }else{
                res.status(500).json({message:"Datos incompletos", code:'500'});
            }
        }
    }catch (e) {
        console.log(e);
    }

});

app.post('/getProviders',async (req,res)=>{
    try {

        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let sortObj = req.body.sort  === undefined ? {} : req.body.sort;
            let page = req.body.page === undefined ? 1 : req.body.page ;  //numero de pagina a mostrar
            let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
            let query = req.body.query === undefined ? {} : req.body.query;
            console.log({page :page , limit: pageSize, sort: sortObj});
            const paginationResult = await Provider.paginate(query, {page :page , limit: pageSize, sort: sortObj}).then();
            let objpagination ={hasNextPage : paginationResult.hasNextPage, page:paginationResult.page, pageSize : paginationResult.limit, totalRows: paginationResult.totalDocs }
            let objresults = paginationResult.docs;

            let objResponse= {};
            objResponse["pagination"] = objpagination;
            objResponse["results"]= objresults;

            res.status(200).json(objResponse);
        }
    }catch (e) {
        console.log(e);
    }

});


    app.post('/getProvidersFull',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ) {
            const result = await Provider.find({fechaBaja: null}).then();
            let objResponse = {};

            try {
                var strippedRows = _.map(result, function (row) {
                    let rowExtend = _.extend({label: row.dependencia, value: row._id}, row.toObject());
                    return rowExtend;
                });
            } catch (e) {
                console.log(e);
            }


            objResponse["results"] = strippedRows;
            res.status(200).json(objResponse);
        }
    }catch (e) {
        console.log(e);
    }
});

app.post('/getCatalogs',async (req,res)=>{
    try {
        var code = validateToken(req);
        let docType= req.body.docType;
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            const result = await Catalog.find({docType: docType}).then();
            let objResponse= {};
            let strippedRows;
            if(docType === "genero" || docType === "ramo"|| docType === "tipoArea" || docType=== "nivelResponsabilidad" || docType === "tipoProcedimiento"){
                try {
                     strippedRows = _.map(result, function (row) {
                        let rowExtend = _.extend({label: row.valor, value: JSON.stringify({clave:row.clave ,valor : row.valor})}, row.toObject());
                        return rowExtend;
                    });
                } catch (e) {
                    console.log(e);
                }
            }else if(docType === "puesto"){
                try {
                     strippedRows = _.map(result, function (row) {
                        let rowExtend = _.extend({label: row.nombre, value: row.nivel}, row.toObject());
                        return rowExtend;
                    });
                } catch (e) {
                    console.log(e);
                }
            }

            objResponse["results"]= strippedRows;
            res.status(200).json(objResponse);
        }
    }catch (e) {
        console.log(e);
    }
});
