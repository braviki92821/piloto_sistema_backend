const Yup = require('yup');

const esquemaS3 = Yup.object().shape({
  expediente: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9 ]{1,25}$'), 'No se permiten cadenas vacías, máximo 25 caracteres').trim(),
  idnombre: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,50}$"), 'No se permiten cadenas vacías, máximo 50 caracteres').required('El campo Nombres de la sección Institución Dependencia es requerido').trim(),
  idsiglas: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,25}$"), 'No se permiten cadenas vacías, máximo 25 caracteres ').trim(),
  idclave: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,25}$"), 'No se permiten cadenas vacías, máximo 25 caracteres').trim(),
  SPSnombres: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'No se permiten números, ni cadenas vacías máximo 25 caracteres ').required('El campo Nombres de Servidor público es requerido').trim(),
  SPSprimerApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'No se permiten números, ni cadenas vacías máximo 25 caracteres').required('El campo Primer apellido de Servidor público es requerido').trim(),
  SPSsegundoApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'No se permiten números, ni cadenas vacías máximo 25 caracteres').trim(),
  SPSgenero: Yup.object(),
  SPSpuesto: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'No se permiten números, ni cadenas vacías máximo 25 caracteres').required('El campo Puesto de Servidor público es requerido').trim(),
  SPSnivel: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,25}$"), 'No se cadenas vacías, máximo 25 caracteres').trim(),
  autoridadSancionadora: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'No se permiten números, ni cadenas vacías máximo 25 caracteres').trim(),
  tipoFalta: Yup.object(),
  tpfdescripcion: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9 ]{1,50}$'), 'No se permiten cadenas vacías, máximo 50 caracteres').trim(),
  tipoSancion: Yup.array().min(1).required('Se requiere seleccionar mínimo una opción del campo Tipo sanción'),
  tsdescripcion: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9 ]{1,50}$'), 'No se permiten cadenas vacías, máximo 50 caracteres').trim(),
  causaMotivoHechos: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9 ]{1,500}$'), 'No se permiten cadenas vacías, máximo 500 caracteres').required('El campo Causa o motivo de la sanción es requerido').trim(),
  resolucionURL: Yup.string().matches(/((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/, 'Introduce una direccion de internet valida'),
  resolucionFecha: Yup.string().required('El campo Fecha de resolución es requerido'),
  multaMonto: Yup.string().matches(new RegExp('^([0-9]*[.])?[0-9]+$'), 'Solo se permiten números enteros o decimales').required('El campo Monto es requerido'),
  multaMoneda: Yup.object().required('El campo Moneda es requerido'),
  inhabilitacionPlazo: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9 ]*$'), 'No se permiten cadenas vacías').trim(),
  inhabilitacionFechaInicial: Yup.string().required('El campo Fecha inicial de la sección  es requerido'),
  inhabilitacionFechaFinal: Yup.string().required('El campo Fecha final de la sección  es requerido'),
  observaciones: Yup.string().matches(new RegExp('^[A-zÀ-ú-0-9 ]{1,500}$'), 'No se permiten cadenas vacías, máximo 500 caracteres').trim(),
  documents: Yup.array().of(
    Yup.object().shape({
      docId: Yup.string(),
      titulo: Yup.string().required('El campo Título de la sección Documentos es requerido ').max(50, 'Máximo 50 caracteres'),
      descripcion: Yup.string().required('El campo Descripción de la sección Documentos es requerido ').max(200, 'Máximo 200 caracteres'),
      url: Yup.string()
        .matches(/((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/, 'Introduce una direccion de internet valida')
        .required('El campo URL de la sección Documentos es requerido'),
      fecha: Yup.string().required('El campo Fecha de la sección Documentos es requerido'),
      tipoDoc: Yup.object()
    })
  )
});

const esquemaS2 = Yup.object().shape({
  ejercicioFiscal: Yup.string().matches(new RegExp('^[0-9]{4}$'), 'Debe tener 4 dígitos'),
  ramo: Yup.string(),
  nombres: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias ').required().trim(),
  primerApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias ').required().trim(),
  segundoApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias ').trim(),
  genero: Yup.object(),
  idnombre: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,100}$"), 'no se permiten cadenas vacias , max 100 caracteres ').required().trim(),
  idsiglas: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,50}$"), 'no se permiten cadenas vacias , max 50 caracteres ').trim(),
  idclave: Yup.string().matches(new RegExp("^[A-zÀ-ú-0-9_.' ]{1,50}$"), 'no se permiten cadenas vacias , max 50 caracteres ').trim(),
  puestoNombre: Yup.string()
    .matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias ')
    .trim()
    .when('puestoNivel', puestoNivel => {
      if (!puestoNivel) return Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,100}$"), 'no se permiten números, ni cadenas vacias, max 100 caracteres ').trim().required('Al menos un campo seccion Puesto, es requerido ');
    }),
  puestoNivel: Yup.string().matches(new RegExp('^[a-zA-Z0-9 ]{1,25}$'), 'no se permiten números, ni cadenas vacias ').trim(),
  tipoArea: Yup.array(),
  nivelResponsabilidad: Yup.array(),
  tipoProcedimiento: Yup.array().min(1).required(),
  sinombres: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias, max 25 caracteres ').trim(),
  siPrimerApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias, max 25 caracteres ').trim(),
  siSegundoApellido: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,25}$"), 'no se permiten números, ni cadenas vacias, max 25 caracteres ').trim(),
  siPuestoNombre: Yup.string().matches(new RegExp("^['A-zÀ-ú-. ]{1,100}$"), 'no se permiten números, ni cadenas vacias, max 100 caracteres ').trim(),
  siPuestoNivel: Yup.string().matches(new RegExp('^[a-zA-Z0-9 ]{1,25}$'), 'no se permiten números, ni cadenas vacias ').trim()
});

const schemaUserCreate = Yup.object().shape({
  vigenciaContrasena: Yup.string().required(),
  fechaAlta: Yup.string().required()
});

const schemaUser = Yup.object().shape({
  nombre: Yup.string().matches(new RegExp("^['A-zÀ-ú ]*$"), 'no se permiten números, ni cadenas vacias').required('El campo nombre es requerido').trim(),
  apellidoUno: Yup.string().matches(new RegExp("^['A-zÀ-ú ]*$"), 'no se permiten números, ni cadenas vacias').required('El campo Primer apellido es requerido').trim(),
  apellidoDos: Yup.string().matches(new RegExp("^['A-zÀ-ú ]*$"), 'no se permiten números, ni cadenas vacias').trim(),
  cargo: Yup.string().matches(new RegExp("^['A-zÀ-ú ]*$"), 'no se permiten números, ni cadenas vacias').required('El campo Cargo es requerido').trim(),
  correoElectronico: Yup.string().required('El campo Correo electrónico es requerido').email(),
  telefono: Yup.string().matches(new RegExp('^[0-9]{10}$'), 'Inserta un número de teléfono valido, 10 caracteres').required('El campo Número de teléfono es requerido').trim(),
  extension: Yup.string().matches(new RegExp('^[0-9]{0,10}$'), 'Inserta un número de extensión valido , maximo 10 caracteres').trim(),
  usuario: Yup.string().matches(new RegExp('^[a-zA-Z0-9]{8,}$'), 'Inserta al menos 8 caracteres, no se permiten caracteres especiales').required('El campo Nombre de usuario es requerido').trim(),
  constrasena: Yup.string().matches(new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*()_+,.\\\\\\/;\':{}¿?!¡@#$%^&*/)(+,.°|:;"=<>_-]).{8,}$'), 'Inserta al menos 8 caracteres, al menos un número, almenos un caracter especial ').required('El campo Contraseña es requerido').trim(),
  sistemas: Yup.array().min(1).required('El campo Sistemas aplicables es requerido'),
  proveedorDatos: Yup.string().required('El campo Proveedor de datos es requerido'),
  estatus: Yup.boolean().required('El campo Estatus es requerido')
});

const schemaProvider = Yup.object().shape({
  dependencia: Yup.string().required('El nombre de la dependencia es requerido').matches(new RegExp('^[ñáéíóúáéíóúÁÉÍÓÚa-zA-Z ]*$'), 'Inserta solamente caracteres'),
  sistemas: Yup.array().min(1).required('El campo sistemas es requerido'),
  estatus: Yup.boolean().required('El campo estatus es requerido'),
  fechaAlta: Yup.string()
});

module.exports = {
  esquemaS3,
  esquemaS2,
  schemaUserCreate,
  schemaUser,
  schemaProvider
};
