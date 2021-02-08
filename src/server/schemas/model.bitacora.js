const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const bitacoraSchema = new Schema({
    tipoOperacion:String,
    fechaOperacion:String,
    usuario:String,
    numeroRegistros:Number,
    sistema: String
});

bitacoraSchema.plugin(mongoosePaginate);

let Bitacora = model('Bitacora', bitacoraSchema, 'bitacora');

module.exports = Bitacora;