import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import * as Yup from 'yup';
import User from './schemas/model.user';
import {spicSchema} from './schemas/model.s2';
import Provider from './schemas/model.proovedor';
import Catalog from './schemas/model.catalog';
import Bitacora from './schemas/model.bitacora';
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


function getArrayFormatTipoProcedimiento(array){
    _.each(array, function(p){
        p.clave = parseInt(p.clave);
    });
    return array;
}

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

const esquemaS2=  Yup.object().shape({
    ejercicioFiscal: Yup.string().matches(new RegExp('^[0-9]{4}$'),'Debe tener 4 dígitos'),
    ramo: Yup.string(),
    nombres : Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias ' ).required().trim(),
    primerApellido : Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias ' ).required().trim(),
    segundoApellido :Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias ' ).trim(),
    genero : Yup.object(),
    idnombre:Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9_\.\' ]{1,50}$'),'no se permiten cadenas vacias , max 50 caracteres ').required().trim(),
    idsiglas: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9_\.\' ]{1,50}$'),'no se permiten cadenas vacias , max 50 caracteres ').trim(),
    idclave: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9_\.\' ]{1,50}$'),'no se permiten cadenas vacias , max 50 caracteres ').trim(),
    puestoNombre: Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias ' ).trim()
        .when('puestoNivel',  (puestoNivel) => {
            if(!puestoNivel)
                return Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias, max 25 caracteres ' ).trim().required("Al menos un campo seccion Puesto, es requerido ")
        }),
    puestoNivel :Yup.string().matches(new RegExp("^[a-zA-Z0-9 ]{1,25}$"),'no se permiten números, ni cadenas vacias ' ).trim(),
    tipoArea: Yup.array(),
    nivelResponsabilidad : Yup.array(),
    tipoProcedimiento :Yup.array().min(1).required(),
    sinombres: Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias, max 25 caracteres ' ).trim() ,
    siPrimerApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias, max 25 caracteres ' ).trim() ,
    siSegundoApellido:Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias, max 25 caracteres ' ).trim() ,
    siPuestoNombre: Yup.string().matches(new RegExp("^['A-zÀ-ú-\. ]{1,25}$"),'no se permiten números, ni cadenas vacias, max 25 caracteres ' ).trim(),
    siPuestoNivel: Yup.string().matches(new RegExp("^[a-zA-Z0-9 ]{1,25}$"),'no se permiten números, ni cadenas vacias ' ).trim()
});

const schemaUserCreate = Yup.object().shape({
    vigenciaContrasena:  Yup.string().required(),
    fechaAlta:  Yup.string().required(),
});

const schemaUser = Yup.object().shape({
    nombre: Yup.string().matches(new RegExp("^['A-zÀ-ú ]*$"),'no se permiten números, ni cadenas vacias' ).required().trim(),
    apellidoUno: Yup.string().matches(new RegExp('^[\'A-zÀ-ú ]*$'),'no se permiten números, ni cadenas vacias' ).required().trim(),
    apellidoDos: Yup.string().matches(new RegExp('^[\'A-zÀ-ú ]*$'),'no se permiten números, ni cadenas vacias' ).trim(),
    cargo: Yup.string().matches(new RegExp('^[\'A-zÀ-ú ]*$'),'no se permiten números, ni cadenas vacias' ).required().trim(),
    correoElectronico: Yup.string().required().email(),
    telefono:  Yup.string().matches(new RegExp('^[0-9]{10}$'), 'Inserta un número de teléfono valido, 10 caracteres').required().trim(),
    extension: Yup.string().matches(new RegExp('^[0-9]{0,10}$'), 'Inserta un número de extensión valido , maximo 10 caracteres').trim(),
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

async function registroBitacora(data){
    let response;
    const nuevaBitacora = new Bitacora(data);
    response = await nuevaBitacora.save();
}

async function validateSchema(doc,schema,validacion){
     let result =  await validacion.validateModel(doc, schema);
     if(result){
        let objError={};
        let arrayErrors = result.errorsWithStringTypes();
        let textErrors;
        console.log("validateSchema docId", doc.id);
        objError["docId"]= doc[0].id;
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
            let arrayDocuments=[];
            let ids= [];
            if(Array.isArray(newdocument)){
                for (let doc of newdocument){
                    doc["id"]= "FAKEID";
                    respuesta.push(await validateSchema([doc],schemaS2,validacion));
                    ids.push(doc.id);
                    arrayDocuments.push(doc);
                }
            }else{
                newdocument["id"]= "FAKEID";
                respuesta.push(await validateSchema([newdocument],schemaS2,validacion));
                arrayDocuments.push(newdocument);
            }

            for(let val of respuesta){
                if(!val.valid){
                    res.status(500).json({message : "Error : La validación no fue exitosa" , Status : 500, response : respuesta});
                }
            }

            //se insertan
            try {
                let Spic = S2.model('Spic',spicSchema, 'spic');
                let response;
                response = await Spic.insertMany(arrayDocuments);
                let detailObject= {};
                detailObject["numeroRegistros"]= arrayDocuments.length;
                res.status(200).json({message : "Se realizarón las inserciones correctamente", Status : 200 , response: response, detail: detailObject});
            }catch (e) {
                console.log(e);
            }

           /* data["tipoOperacion"]="POST";
            data["fechaOperacion"]= moment().format();
            data["usuario"]=req.body.request.user;
            data["numeroRegistros"]=1;
            data["sistema"]="S2";
            registroBitacora(data);*/

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
                var data=[];

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

                let fechaActual = moment();
                req.body["fechaAlta"]= fechaActual.format();
                req.body["vigenciaContrasena"] = fechaActual.add(3 , 'months').format().toString();
                req.body["estatus"]=  true;

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
                 if(req.body.passwordConfirmation){
                     delete req.body.passwordConfirmation;
                 }

                  console.log(req.body);
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

            console.log({page :page , limit: pageSize, sort: sortObj, query: query});
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


app.post('/updateS2Schema',async (req,res)=>{
    try {
        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let docSend={};
            let values = req.body;
            //validaciones
            console.log("estamos en las validaciones ");
            try {
                await esquemaS2.validate(values);
            }catch (e) {
                let errorMessage = {};
                errorMessage["errores"] = e.errors;
                errorMessage["campo"]= e.path;
                errorMessage["tipoError"] = e.type;
                errorMessage["mensaje"] = e.message;
                res.status(400).json(errorMessage);
            }

            docSend["id"]= values._id;
            if(values.fechaCaptura){docSend["fechaCaptura"]= values.fechaCaptura;}
            if(values.ejercicioFiscal){docSend["ejercicioFiscal"]= values.ejercicioFiscal;}
            if(values.ramo){
                let ramoObj = JSON.parse(values.ramo);
                docSend["ramo"]= {clave:  parseInt(ramoObj.clave) , valor: ramoObj.valor };
            }
            if(values.nombres){docSend["nombres"]=values.nombres}
            if(values.primerApellido){docSend["primerApellido"]=values.primerApellido}
            if(values.segundoApellido){docSend["segundoApellido"]= values.segundoApellido}
            if(values.genero){
                docSend["genero"]= JSON.parse(values.genero);
            }

            let ObjInstitucionDepe = {};
            if(values.idnombre){  ObjInstitucionDepe = {...ObjInstitucionDepe,nombre : values.idnombre } }
            if(values.idclave){ObjInstitucionDepe = {...ObjInstitucionDepe,clave: values.idclave } }
            if(values.idsiglas){ObjInstitucionDepe = {...ObjInstitucionDepe,siglas: values.idsiglas } }
            docSend["institucionDependencia"] = ObjInstitucionDepe;


            let objPuesto = {}
            if(values.puestoNombre){objPuesto= {...objPuesto,nombre: values.puestoNombre}}
            if(values.puestoNivel){objPuesto= {...objPuesto, nivel: values.puestoNivel}}
            docSend["puesto"]= objPuesto;


            if(values.tipoArea && values.tipoArea.length > 0 ){
                docSend["tipoArea"]=JSON.parse("["+values.tipoArea+"]");
            }
            if(values.tipoProcedimiento && values.tipoProcedimiento.length > 0){
                let ObjTipoProcedimiento= JSON.parse("["+values.tipoProcedimiento+"]");
                docSend["tipoProcedimiento"]= getArrayFormatTipoProcedimiento(ObjTipoProcedimiento);
            }
            if(values.nivelResponsabilidad && values.nivelResponsabilidad.length > 0 ){
                docSend["nivelResponsabilidad"] = JSON.parse("[" + values.nivelResponsabilidad + "]");
            }

            let objSuperiorInmediato = {};
            if(values.sinombres){
                objSuperiorInmediato = {...objSuperiorInmediato, nombres: values.sinombres}
            }
            if(values.siPrimerApellido){
                objSuperiorInmediato = {...objSuperiorInmediato, primerApellido: values.siPrimerApellido}
            }
            if(values.siSegundoApellido){
                objSuperiorInmediato = {...objSuperiorInmediato, segundoApellido : values.siSegundoApellido}
            }
            let puestoObj={};
            if(values.siPuestoNombre){
                puestoObj =  {...puestoObj,nombre:values.siPuestoNombre};
            }
            if(values.siPuestoNivel){
                puestoObj =  {...puestoObj,nivel: values.siPuestoNivel};
            }
            if(values.siPuestoNombre || values.siPuestoNivel ){
                objSuperiorInmediato = {...objSuperiorInmediato,puesto: puestoObj}
            }

            docSend["superiorInmediato"] = objSuperiorInmediato;

            console.log("ya paso la validacion  "+ JSON.stringify(docSend));

            let fileContents = fs.readFileSync( path.resolve(__dirname, '../src/resource/openapis2.yaml'), 'utf8');
            let data = yaml.safeLoad(fileContents);
            let schemaS2 =  data.components.schemas.respSpic;
            let validacion = new swaggerValidator.Handler();
            let newdocument = docSend;
            let respuesta = await validateSchema([newdocument],schemaS2,validacion);
            if(respuesta.valid) {
                try {
                    docSend["_id"]= values._id;
                    let Spic = S2.model('Spic',spicSchema, 'spic');
                    let esquema = new Spic(docSend);
                    console.log("IDDD"+ esquema);
                    let response;
                    if(req.body._id ){
                        await Spic.findByIdAndDelete(values._id);
                        response = await Spic.findByIdAndUpdate(values._id ,esquema, {upsert: true, new: true} ).exec();
                        res.status(200).json(response);
                    }else{
                        res.status(500).json({message : "Error : Datos incompletos" , Status : 500});
                    }
                }catch (e) {
                    console.log(e);
                }
            }else{
                console.log(respuesta);
                res.status(400).json({message : "Error in validation openApi" , Status : 400, response : respuesta});
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

            console.log({page :"pages" , limit: "pageSize", sort: "sortObj"});
            objResponse["results"] = strippedRows;
            res.status(200).json(objResponse);
        }
    }catch (e) {
        console.log(e);
    }
});

app.post('/getUsersAll',async (req,res)=>{
    try {

        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ) {
            const result = await User.find();
            let objResponse = {};

            try {
                var strippedRows = _.map(result, function (row) {
                    let rowExtend = _.extend({label: (row.nombre+" "+row.apellidoUno+" "+row.apellidoDos), value: row._id}, row.toObject());
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

app.post('/getBitacora',async (req,res)=>{
    try {
       function horaActual(horaAct){
            var zona = (new Date()).getTimezoneOffset()*60000 ; //offset in milliseconds
            var hora = (new Date(horaAct-zona)).toISOString().slice(0, -5);
            return hora;
        }
        var fechaInicial=horaActual(new Date(req.body.fechaInicial));
        var fechaFinal=horaActual(new Date(req.body.fechaFinal));
        let objResponse= {};
        let strippedRows;

        var code = validateToken(req);
        if(code.code == 401){
            res.status(401).json({code: '401', message: code.message});
        }else if (code.code == 200 ){
            let sortObj = req.body.sort  === undefined ? {} : req.body.sort;
            let page = req.body.page === undefined ? 1 : req.body.page ;  //numero de pagina a mostrar
            let pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;
            let query = req.body.query === undefined ? {} : req.body.query;
            console.log({page :page , limit: pageSize, sort: sortObj});
            if(((typeof req.body.sistema!="undefined")) && ((typeof req.body.usuarioBitacora !="undefined"))){
                var paginationResult = await Bitacora.find({fechaOperacion: { $gte: fechaInicial, $lte : fechaFinal }, usuario: { $eq : req.body.usuarioBitacora }, sistema: { $in : req.body.sistema }});
            }else if((typeof req.body.sistema!="undefined")){
                var paginationResult = await Bitacora.find({fechaOperacion: { $gte: fechaInicial, $lte : fechaFinal },sistema: {$in : req.body.sistema }});
            }else if((typeof req.body.usuarioBitacora!="undefined")){
                var paginationResult = await Bitacora.find({fechaOperacion: { $gte: fechaInicial, $lte :fechaFinal }, usuario: req.body.usuarioBitacora});
            }else{
                var paginationResult = await Bitacora.find({fechaOperacion: { $gte: fechaInicial, $lte : fechaFinal }});
                moment.locale('es');



                strippedRows = _.map(paginationResult, function (row) {
                    var fecha=moment(row.fechaOperacion).format('LLLL');

                    var sistema=row.sistema;
                    var sistema_label="";
                    var tipoOperacion=row.tipoOperacion;
                    var tipo="";

                    if(sistema=="S2"){
                        sistema_label="Sistema de Servidores Públicos que Intervienen en Procedimientos de Contratación.";
                    }
                    if(sistema=="S3S"){
                        sistema_label="Sistema de los Servidores Públicos Sancionados.";
                    }
                    if(sistema=="S3P"){
                        sistema_label="Sistema de los Particulares Sancionados.";
                    }

                    if(tipoOperacion=="CREATE"){
                        tipo="Alta";
                    }
                    if(tipoOperacion=="DELETE"){
                        tipo="Eliminación";
                    }
                    if(tipoOperacion=="UPDATE"){
                        tipo="Actualización";
                    }
                    if(tipoOperacion=="READ"){
                        tipo="Consulta";
                    }


                    let rowExtend = _.extend({fecha: fecha,tipo:tipo, sistema_label:sistema_label}, row.toObject());
                    return rowExtend;
                });
                console.log(strippedRows);
                //console.log(paginationResult);
                paginationResult["resultado"]=strippedRows;
            }

            let objpagination ={hasNextPage : paginationResult.hasNextPage, page:paginationResult.page, pageSize : paginationResult.limit, totalRows: paginationResult.totalDocs }
            let objresults = paginationResult;
            let objResponse= {};
            objResponse["pagination"] = objpagination;
            objResponse["results"]= paginationResult["resultado"];

            res.status(200).json(objResponse);
            //console.log(objResponse);
        }
    }catch (e) {
        console.log(e);
    }

});
