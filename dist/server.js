/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/server/server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/server/schemas/model.proovedor.js":
/*!***********************************************!*\
  !*** ./src/server/schemas/model.proovedor.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var _require = __webpack_require__(/*! mongoose */ \"mongoose\"),\n    Schema = _require.Schema,\n    model = _require.model;\n\nvar mongoosePaginate = __webpack_require__(/*! mongoose-paginate-v2 */ \"mongoose-paginate-v2\");\n\nvar providerSchema = new Schema({\n  dependencia: String,\n  fechaAlta: String,\n  fechaBaja: String,\n  fechaActualizacion: String,\n  estatus: Boolean,\n  sistemas: {\n    type: [],\n    default: void 0\n  }\n});\nproviderSchema.plugin(mongoosePaginate);\nvar Proovedor = model('Proovedores', providerSchema, 'proovedores');\nmodule.exports = Proovedor;\n\n//# sourceURL=webpack:///./src/server/schemas/model.proovedor.js?");

/***/ }),

/***/ "./src/server/schemas/model.user.js":
/*!******************************************!*\
  !*** ./src/server/schemas/model.user.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var _require = __webpack_require__(/*! mongoose */ \"mongoose\"),\n    Schema = _require.Schema,\n    model = _require.model;\n\nvar mongoosePaginate = __webpack_require__(/*! mongoose-paginate-v2 */ \"mongoose-paginate-v2\");\n\nvar userSchema = new Schema({\n  nombre: String,\n  apellidoUno: String,\n  apellidoDos: String,\n  cargo: String,\n  correoElectronico: String,\n  telefono: String,\n  extension: String,\n  usuario: String,\n  constrasena: String,\n  sistemas: {\n    type: [],\n    default: void 0\n  },\n  fechaAlta: String,\n  fechaBaja: String,\n  estatus: Boolean,\n  vigenciaContrasena: String,\n  proveedorDatos: String\n});\nuserSchema.plugin(mongoosePaginate);\nvar User = model('Usuarios', userSchema, 'usuarios');\nmodule.exports = User;\n\n//# sourceURL=webpack:///./src/server/schemas/model.user.js?");

/***/ }),

/***/ "./src/server/server.js":
/*!******************************!*\
  !*** ./src/server/server.js ***!
  \******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cors */ \"cors\");\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _schemas_model_user__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./schemas/model.user */ \"./src/server/schemas/model.user.js\");\n/* harmony import */ var _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_schemas_model_user__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./schemas/model.proovedor */ \"./src/server/schemas/model.proovedor.js\");\n/* harmony import */ var _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! moment */ \"moment\");\n/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var regenerator_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! regenerator-runtime */ \"regenerator-runtime\");\n/* harmony import */ var regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime__WEBPACK_IMPORTED_MODULE_7__);\nfunction _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === \"undefined\" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === \"number\") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError(\"Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\n\n\n\n\n\n\n\n\nvar mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\n\nvar yaml = __webpack_require__(/*! js-yaml */ \"js-yaml\");\n\nvar fs = __webpack_require__(/*! fs */ \"fs\");\n\nvar SwaggerClient = __webpack_require__(/*! swagger-client */ \"swagger-client\");\n\nvar Validator = __webpack_require__(/*! swagger-model-validator */ \"swagger-model-validator\");\n\nvar validator = new Validator(SwaggerClient);\n\nvar swaggerValidator = __webpack_require__(/*! swagger-object-validator */ \"swagger-object-validator\");\n\nvar _ = __webpack_require__(/*! underscore */ \"underscore\");\n\nvar jwt = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n\n //connection mongo db\n\nconsole.log('mongodb://' + \"anmartinez\" + ':' + \"anmartinez\" + '@' + \"35.226.19.219:27017\" + '/' + \"administracionUsuarios\");\nvar db = mongoose.connect('mongodb://' + \"anmartinez\" + ':' + \"anmartinez\" + '@' + \"35.226.19.219:27017\" + '/' + \"administracionUsuarios\", {\n  useNewUrlParser: true,\n  useUnifiedTopology: true\n}).then(function () {\n  return console.log('Connect to MongoDB..');\n}).catch(function (err) {\n  return console.error('Could not connect to MongoDB..', err);\n});\nmongoose.set('useFindAndModify', false); //let port = process.env.PORT || 7777;\n\nvar app = express__WEBPACK_IMPORTED_MODULE_0___default()();\napp.use(cors__WEBPACK_IMPORTED_MODULE_1___default()(), body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.urlencoded({\n  extended: true\n}), body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.json());\nvar server = app.listen(3004, function () {\n  var host = server.address().address;\n  var port = server.address().port;\n  console.log(' function cloud Server is listening at http://%s:%s', host, port);\n});\n\nvar validateToken = function validateToken(req) {\n  var inToken = null;\n  var auth = req.headers['authorization'];\n\n  if (auth && auth.toLowerCase().indexOf('bearer') == 0) {\n    inToken = auth.slice('bearer '.length);\n  } else if (req.body && req.body.access_token) {\n    inToken = req.body.access_token;\n  } else if (req.query && req.query.access_token) {\n    inToken = req.query.access_token;\n  } // invalid token - synchronous\n\n\n  try {\n    var decoded = jwt.verify(inToken, \"YTBGD9YjAUhkjQk9ZXcb\");\n    return {\n      code: 200,\n      message: decoded\n    };\n  } catch (err) {\n    // err\n    var error = \"\";\n\n    if (err.message === \"jwt must be provided\") {\n      error = \"Error el token de autenticación (JWT) es requerido en el header, favor de verificar\";\n    } else if (err.message === \"invalid signature\" || err.message.includes(\"Unexpected token\")) {\n      error = \"Error token inválido, el token probablemente ha sido modificado favor de verificar\";\n    } else if (err.message === \"jwt expired\") {\n      error = \"Error el token de autenticación (JWT) ha expirado, favor de enviar uno válido \";\n    } else {\n      error = err.message;\n    }\n\n    var obj = {\n      code: 401,\n      message: error\n    };\n    return obj;\n  }\n};\n\nfunction validateSchema(_x, _x2, _x3) {\n  return _validateSchema.apply(this, arguments);\n}\n\nfunction _validateSchema() {\n  _validateSchema = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee12(doc, schema, validacion) {\n    var result, objError, arrayErrors, textErrors, errors, _iterator2, _step2, error, obj, _path, _iterator3, _step3, ruta;\n\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee12$(_context12) {\n      while (1) {\n        switch (_context12.prev = _context12.next) {\n          case 0:\n            _context12.next = 2;\n            return validacion.validateModel(doc, schema);\n\n          case 2:\n            result = _context12.sent;\n\n            if (!result) {\n              _context12.next = 15;\n              break;\n            }\n\n            objError = {};\n            arrayErrors = result.errorsWithStringTypes();\n            objError[\"docId\"] = doc.id;\n            objError[\"valid\"] = arrayErrors.length === 0 ? true : false;\n            objError[\"errorCount\"] = arrayErrors.length;\n            errors = [];\n            _iterator2 = _createForOfIteratorHelper(arrayErrors);\n\n            try {\n              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {\n                error = _step2.value;\n                obj = {};\n                obj[\"typeError\"] = error.errorType;\n                _path = \"\";\n                _iterator3 = _createForOfIteratorHelper(error.trace);\n\n                try {\n                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {\n                    ruta = _step3.value;\n                    _path = _path + ruta.stepName + \"/\";\n                  }\n                } catch (err) {\n                  _iterator3.e(err);\n                } finally {\n                  _iterator3.f();\n                }\n\n                obj[\"pathError\"] = _path;\n                errors.push(obj);\n              }\n            } catch (err) {\n              _iterator2.e(err);\n            } finally {\n              _iterator2.f();\n            }\n\n            objError[\"errors\"] = errors;\n            objError[\"errorsHumanReadable\"] = result.humanReadable();\n            return _context12.abrupt(\"return\", objError);\n\n          case 15:\n          case \"end\":\n            return _context12.stop();\n        }\n      }\n    }, _callee12);\n  }));\n  return _validateSchema.apply(this, arguments);\n}\n\napp.post('/validateSchemaS2', /*#__PURE__*/function () {\n  var _ref = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee(req, res) {\n    var code, fileContents, data, schemaS2, validacion, newdocument, respuesta, _iterator, _step, doc;\n\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            _context.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context.next = 42;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context.next = 42;\n              break;\n            }\n\n            fileContents = fs.readFileSync(path__WEBPACK_IMPORTED_MODULE_3___default.a.resolve(__dirname, '../app/resource/openapis2.yaml'), 'utf8');\n            data = yaml.safeLoad(fileContents);\n            schemaS2 = data.components.schemas.respSpic_inner;\n            validacion = new swaggerValidator.Handler();\n            newdocument = req.body;\n            respuesta = [];\n\n            if (!Array.isArray(newdocument)) {\n              _context.next = 36;\n              break;\n            }\n\n            _iterator = _createForOfIteratorHelper(newdocument);\n            _context.prev = 15;\n\n            _iterator.s();\n\n          case 17:\n            if ((_step = _iterator.n()).done) {\n              _context.next = 26;\n              break;\n            }\n\n            doc = _step.value;\n            _context.t0 = respuesta;\n            _context.next = 22;\n            return validateSchema(doc, schemaS2, validacion);\n\n          case 22:\n            _context.t1 = _context.sent;\n\n            _context.t0.push.call(_context.t0, _context.t1);\n\n          case 24:\n            _context.next = 17;\n            break;\n\n          case 26:\n            _context.next = 31;\n            break;\n\n          case 28:\n            _context.prev = 28;\n            _context.t2 = _context[\"catch\"](15);\n\n            _iterator.e(_context.t2);\n\n          case 31:\n            _context.prev = 31;\n\n            _iterator.f();\n\n            return _context.finish(31);\n\n          case 34:\n            _context.next = 41;\n            break;\n\n          case 36:\n            _context.t3 = respuesta;\n            _context.next = 39;\n            return validateSchema(newdocument, schemaS2, validacion);\n\n          case 39:\n            _context.t4 = _context.sent;\n\n            _context.t3.push.call(_context.t3, _context.t4);\n\n          case 41:\n            res.status(200).json(respuesta);\n\n          case 42:\n            _context.next = 47;\n            break;\n\n          case 44:\n            _context.prev = 44;\n            _context.t5 = _context[\"catch\"](0);\n            console.log(_context.t5);\n\n          case 47:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee, null, [[0, 44], [15, 28, 31, 34]]);\n  }));\n\n  return function (_x4, _x5) {\n    return _ref.apply(this, arguments);\n  };\n}());\napp.delete('/deleteUser', /*#__PURE__*/function () {\n  var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee2(req, res) {\n    var code, fechabaja, response;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee2$(_context2) {\n      while (1) {\n        switch (_context2.prev = _context2.next) {\n          case 0:\n            _context2.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context2.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context2.next = 16;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context2.next = 16;\n              break;\n            }\n\n            if (!req.body.request._id) {\n              _context2.next = 15;\n              break;\n            }\n\n            fechabaja = moment__WEBPACK_IMPORTED_MODULE_6___default()().format();\n            _context2.next = 11;\n            return _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a.findByIdAndUpdate(req.body.request._id, {\n              $set: {\n                fechaBaja: fechabaja\n              }\n            }).exec();\n\n          case 11:\n            response = _context2.sent;\n            res.status(200).json({\n              message: \"OK\",\n              Status: 200,\n              response: response\n            });\n            _context2.next = 16;\n            break;\n\n          case 15:\n            res.status(500).json([{\n              \"Error\": \"Datos incompletos\"\n            }]);\n\n          case 16:\n            _context2.next = 21;\n            break;\n\n          case 18:\n            _context2.prev = 18;\n            _context2.t0 = _context2[\"catch\"](0);\n            console.log(_context2.t0);\n\n          case 21:\n          case \"end\":\n            return _context2.stop();\n        }\n      }\n    }, _callee2, null, [[0, 18]]);\n  }));\n\n  return function (_x6, _x7) {\n    return _ref2.apply(this, arguments);\n  };\n}());\napp.delete('/deleteProvider', /*#__PURE__*/function () {\n  var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee3(req, res) {\n    var code, fechabaja, response;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee3$(_context3) {\n      while (1) {\n        switch (_context3.prev = _context3.next) {\n          case 0:\n            _context3.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context3.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context3.next = 13;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context3.next = 13;\n              break;\n            }\n\n            if (!req.body.request._id) {\n              _context3.next = 13;\n              break;\n            }\n\n            fechabaja = moment__WEBPACK_IMPORTED_MODULE_6___default()().format();\n            _context3.next = 11;\n            return _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a.findByIdAndUpdate(req.body.request._id, {\n              $set: {\n                fechaBaja: fechabaja\n              }\n            }).exec();\n\n          case 11:\n            response = _context3.sent;\n            res.status(200).json({\n              message: \"OK\",\n              Status: 200,\n              response: response\n            });\n\n          case 13:\n            _context3.next = 18;\n            break;\n\n          case 15:\n            _context3.prev = 15;\n            _context3.t0 = _context3[\"catch\"](0);\n            console.log(_context3.t0);\n\n          case 18:\n          case \"end\":\n            return _context3.stop();\n        }\n      }\n    }, _callee3, null, [[0, 15]]);\n  }));\n\n  return function (_x8, _x9) {\n    return _ref3.apply(this, arguments);\n  };\n}());\napp.post('/create/provider', /*#__PURE__*/function () {\n  var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee4(req, res) {\n    var code, nuevoProovedor, responce;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee4$(_context4) {\n      while (1) {\n        switch (_context4.prev = _context4.next) {\n          case 0:\n            _context4.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context4.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context4.next = 21;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context4.next = 21;\n              break;\n            }\n\n            nuevoProovedor = new _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a(req.body);\n\n            if (!(req.body['dependencia'] == \"\" || req.body['dependencia'] == null || req.body['sistemas'] == \"\" || req.body['sistemas'] == null)) {\n              _context4.next = 11;\n              break;\n            }\n\n            res.status(500).json([{\n              \"Error\": \"Datos incompletos\"\n            }]);\n            return _context4.abrupt(\"return\", false);\n\n          case 11:\n            if (!req.body._id) {\n              _context4.next = 17;\n              break;\n            }\n\n            _context4.next = 14;\n            return _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a.findByIdAndUpdate(req.body._id, nuevoProovedor).exec();\n\n          case 14:\n            responce = _context4.sent;\n            _context4.next = 20;\n            break;\n\n          case 17:\n            _context4.next = 19;\n            return nuevoProovedor.save();\n\n          case 19:\n            responce = _context4.sent;\n\n          case 20:\n            res.status(200).json(responce);\n\n          case 21:\n            _context4.next = 26;\n            break;\n\n          case 23:\n            _context4.prev = 23;\n            _context4.t0 = _context4[\"catch\"](0);\n            console.log(_context4.t0);\n\n          case 26:\n          case \"end\":\n            return _context4.stop();\n        }\n      }\n    }, _callee4, null, [[0, 23]]);\n  }));\n\n  return function (_x10, _x11) {\n    return _ref4.apply(this, arguments);\n  };\n}());\napp.put('/edit/provider', /*#__PURE__*/function () {\n  var _ref5 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee5(req, res) {\n    var code, nuevoProovedor, responce;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee5$(_context5) {\n      while (1) {\n        switch (_context5.prev = _context5.next) {\n          case 0:\n            _context5.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context5.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context5.next = 19;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context5.next = 19;\n              break;\n            }\n\n            nuevoProovedor = new _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a(req.body);\n\n            if (!(req.body['dependencia'] == \"\" || req.body['dependencia'] == null || req.body['sistemas'] == \"\" || req.body['sistemas'] == null)) {\n              _context5.next = 11;\n              break;\n            }\n\n            res.status(500).json([{\n              \"Error\": \"Datos incompletos\"\n            }]);\n            return _context5.abrupt(\"return\", false);\n\n          case 11:\n            if (!req.body._id) {\n              _context5.next = 18;\n              break;\n            }\n\n            _context5.next = 14;\n            return _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a.findByIdAndUpdate(req.body._id, nuevoProovedor).exec();\n\n          case 14:\n            responce = _context5.sent;\n            res.status(200).json(responce);\n            _context5.next = 19;\n            break;\n\n          case 18:\n            res.status(500).json({\n              message: \"Error : Datos incompletos\",\n              Status: 500\n            });\n\n          case 19:\n            _context5.next = 24;\n            break;\n\n          case 21:\n            _context5.prev = 21;\n            _context5.t0 = _context5[\"catch\"](0);\n            console.log(_context5.t0);\n\n          case 24:\n          case \"end\":\n            return _context5.stop();\n        }\n      }\n    }, _callee5, null, [[0, 21]]);\n  }));\n\n  return function (_x12, _x13) {\n    return _ref5.apply(this, arguments);\n  };\n}());\napp.post('/create/user', /*#__PURE__*/function () {\n  var _ref6 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee6(req, res) {\n    var code, nuevoUsuario, response;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee6$(_context6) {\n      while (1) {\n        switch (_context6.prev = _context6.next) {\n          case 0:\n            _context6.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context6.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context6.next = 18;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context6.next = 18;\n              break;\n            }\n\n            nuevoUsuario = new _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a(req.body);\n\n            if (!req.body._id) {\n              _context6.next = 14;\n              break;\n            }\n\n            _context6.next = 11;\n            return _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a.findByIdAndUpdate(req.body._id, nuevoUsuario).exec();\n\n          case 11:\n            response = _context6.sent;\n            _context6.next = 17;\n            break;\n\n          case 14:\n            _context6.next = 16;\n            return nuevoUsuario.save();\n\n          case 16:\n            response = _context6.sent;\n\n          case 17:\n            res.status(200).json(response);\n\n          case 18:\n            _context6.next = 23;\n            break;\n\n          case 20:\n            _context6.prev = 20;\n            _context6.t0 = _context6[\"catch\"](0);\n            console.log(_context6.t0);\n\n          case 23:\n          case \"end\":\n            return _context6.stop();\n        }\n      }\n    }, _callee6, null, [[0, 20]]);\n  }));\n\n  return function (_x14, _x15) {\n    return _ref6.apply(this, arguments);\n  };\n}());\napp.put('/edit/user', /*#__PURE__*/function () {\n  var _ref7 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee7(req, res) {\n    var code, nuevoUsuario, response;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee7$(_context7) {\n      while (1) {\n        switch (_context7.prev = _context7.next) {\n          case 0:\n            _context7.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context7.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context7.next = 16;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context7.next = 16;\n              break;\n            }\n\n            nuevoUsuario = new _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a(req.body);\n\n            if (!req.body._id) {\n              _context7.next = 15;\n              break;\n            }\n\n            _context7.next = 11;\n            return _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a.findByIdAndUpdate(req.body._id, nuevoUsuario).exec();\n\n          case 11:\n            response = _context7.sent;\n            res.status(200).json(response);\n            _context7.next = 16;\n            break;\n\n          case 15:\n            res.status(500).json({\n              message: \"Error : Datos incompletos\",\n              Status: 500\n            });\n\n          case 16:\n            _context7.next = 21;\n            break;\n\n          case 18:\n            _context7.prev = 18;\n            _context7.t0 = _context7[\"catch\"](0);\n            console.log(_context7.t0);\n\n          case 21:\n          case \"end\":\n            return _context7.stop();\n        }\n      }\n    }, _callee7, null, [[0, 18]]);\n  }));\n\n  return function (_x16, _x17) {\n    return _ref7.apply(this, arguments);\n  };\n}());\napp.post('/getUsers', /*#__PURE__*/function () {\n  var _ref8 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee8(req, res) {\n    var sortObj, page, pageSize, query, paginationResult, objpagination, objresults, objResponse;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee8$(_context8) {\n      while (1) {\n        switch (_context8.prev = _context8.next) {\n          case 0:\n            _context8.prev = 0;\n            sortObj = req.body.sort === undefined ? {} : req.body.sort;\n            page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar\n\n            pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;\n            query = req.body.query === undefined ? {} : req.body.query;\n            _context8.next = 7;\n            return _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a.paginate(query, {\n              page: page,\n              limit: pageSize,\n              sort: sortObj\n            }).then();\n\n          case 7:\n            paginationResult = _context8.sent;\n            objpagination = {\n              hasNextPage: paginationResult.hasNextPage,\n              page: paginationResult.page,\n              pageSize: paginationResult.limit,\n              totalRows: paginationResult.totalDocs\n            };\n            objresults = paginationResult.docs;\n            objResponse = {};\n            objResponse[\"pagination\"] = objpagination;\n            objResponse[\"results\"] = objresults;\n            res.status(200).json(objResponse);\n            _context8.next = 19;\n            break;\n\n          case 16:\n            _context8.prev = 16;\n            _context8.t0 = _context8[\"catch\"](0);\n            console.log(_context8.t0);\n\n          case 19:\n          case \"end\":\n            return _context8.stop();\n        }\n      }\n    }, _callee8, null, [[0, 16]]);\n  }));\n\n  return function (_x18, _x19) {\n    return _ref8.apply(this, arguments);\n  };\n}());\napp.post('/getUsersFull', /*#__PURE__*/function () {\n  var _ref9 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee9(req, res) {\n    var code, result, objResponse;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee9$(_context9) {\n      while (1) {\n        switch (_context9.prev = _context9.next) {\n          case 0:\n            _context9.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context9.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context9.next = 13;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context9.next = 13;\n              break;\n            }\n\n            _context9.next = 9;\n            return _schemas_model_user__WEBPACK_IMPORTED_MODULE_4___default.a.find({\n              fechaBaja: null\n            }).then();\n\n          case 9:\n            result = _context9.sent;\n            objResponse = {};\n            objResponse[\"results\"] = result;\n            res.status(200).json(objResponse);\n\n          case 13:\n            _context9.next = 18;\n            break;\n\n          case 15:\n            _context9.prev = 15;\n            _context9.t0 = _context9[\"catch\"](0);\n            console.log(_context9.t0);\n\n          case 18:\n          case \"end\":\n            return _context9.stop();\n        }\n      }\n    }, _callee9, null, [[0, 15]]);\n  }));\n\n  return function (_x20, _x21) {\n    return _ref9.apply(this, arguments);\n  };\n}());\napp.post('/getProviders', /*#__PURE__*/function () {\n  var _ref10 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee10(req, res) {\n    var sortObj, page, pageSize, query, paginationResult, objpagination, objresults, objResponse;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee10$(_context10) {\n      while (1) {\n        switch (_context10.prev = _context10.next) {\n          case 0:\n            _context10.prev = 0;\n            sortObj = req.body.sort === undefined ? {} : req.body.sort;\n            page = req.body.page === undefined ? 1 : req.body.page; //numero de pagina a mostrar\n\n            pageSize = req.body.pageSize === undefined ? 10 : req.body.pageSize;\n            query = req.body.query === undefined ? {} : req.body.query;\n            console.log({\n              page: page,\n              limit: pageSize,\n              sort: sortObj\n            });\n            _context10.next = 8;\n            return _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a.paginate(query, {\n              page: page,\n              limit: pageSize,\n              sort: sortObj\n            }).then();\n\n          case 8:\n            paginationResult = _context10.sent;\n            objpagination = {\n              hasNextPage: paginationResult.hasNextPage,\n              page: paginationResult.page,\n              pageSize: paginationResult.limit,\n              totalRows: paginationResult.totalDocs\n            };\n            objresults = paginationResult.docs;\n            objResponse = {};\n            objResponse[\"pagination\"] = objpagination;\n            objResponse[\"results\"] = objresults;\n            res.status(200).json(objResponse);\n            _context10.next = 20;\n            break;\n\n          case 17:\n            _context10.prev = 17;\n            _context10.t0 = _context10[\"catch\"](0);\n            console.log(_context10.t0);\n\n          case 20:\n          case \"end\":\n            return _context10.stop();\n        }\n      }\n    }, _callee10, null, [[0, 17]]);\n  }));\n\n  return function (_x22, _x23) {\n    return _ref10.apply(this, arguments);\n  };\n}());\napp.post('/getProvidersFull', /*#__PURE__*/function () {\n  var _ref11 = _asyncToGenerator( /*#__PURE__*/regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee11(req, res) {\n    var code, result, objResponse, strippedRows;\n    return regenerator_runtime__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee11$(_context11) {\n      while (1) {\n        switch (_context11.prev = _context11.next) {\n          case 0:\n            _context11.prev = 0;\n            code = validateToken(req);\n\n            if (!(code.code == 401)) {\n              _context11.next = 6;\n              break;\n            }\n\n            res.status(401).json({\n              code: '401',\n              message: code.message\n            });\n            _context11.next = 14;\n            break;\n\n          case 6:\n            if (!(code.code == 200)) {\n              _context11.next = 14;\n              break;\n            }\n\n            _context11.next = 9;\n            return _schemas_model_proovedor__WEBPACK_IMPORTED_MODULE_5___default.a.find({\n              fechaBaja: null\n            }).then();\n\n          case 9:\n            result = _context11.sent;\n            objResponse = {};\n\n            try {\n              strippedRows = _.map(result, function (row) {\n                var rowExtend = _.extend({\n                  label: row.dependencia,\n                  value: row._id\n                }, row.toObject());\n\n                return rowExtend;\n              });\n            } catch (e) {\n              console.log(e);\n            }\n\n            objResponse[\"results\"] = strippedRows;\n            res.status(200).json(objResponse);\n\n          case 14:\n            _context11.next = 19;\n            break;\n\n          case 16:\n            _context11.prev = 16;\n            _context11.t0 = _context11[\"catch\"](0);\n            console.log(_context11.t0);\n\n          case 19:\n          case \"end\":\n            return _context11.stop();\n        }\n      }\n    }, _callee11, null, [[0, 16]]);\n  }));\n\n  return function (_x24, _x25) {\n    return _ref11.apply(this, arguments);\n  };\n}());\n\n//# sourceURL=webpack:///./src/server/server.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"cors\");\n\n//# sourceURL=webpack:///external_%22cors%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "js-yaml":
/*!**************************!*\
  !*** external "js-yaml" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"js-yaml\");\n\n//# sourceURL=webpack:///external_%22js-yaml%22?");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"jsonwebtoken\");\n\n//# sourceURL=webpack:///external_%22jsonwebtoken%22?");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"moment\");\n\n//# sourceURL=webpack:///external_%22moment%22?");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mongoose\");\n\n//# sourceURL=webpack:///external_%22mongoose%22?");

/***/ }),

/***/ "mongoose-paginate-v2":
/*!***************************************!*\
  !*** external "mongoose-paginate-v2" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mongoose-paginate-v2\");\n\n//# sourceURL=webpack:///external_%22mongoose-paginate-v2%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ }),

/***/ "regenerator-runtime":
/*!**************************************!*\
  !*** external "regenerator-runtime" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"regenerator-runtime\");\n\n//# sourceURL=webpack:///external_%22regenerator-runtime%22?");

/***/ }),

/***/ "swagger-client":
/*!*********************************!*\
  !*** external "swagger-client" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"swagger-client\");\n\n//# sourceURL=webpack:///external_%22swagger-client%22?");

/***/ }),

/***/ "swagger-model-validator":
/*!******************************************!*\
  !*** external "swagger-model-validator" ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"swagger-model-validator\");\n\n//# sourceURL=webpack:///external_%22swagger-model-validator%22?");

/***/ }),

/***/ "swagger-object-validator":
/*!*******************************************!*\
  !*** external "swagger-object-validator" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"swagger-object-validator\");\n\n//# sourceURL=webpack:///external_%22swagger-object-validator%22?");

/***/ }),

/***/ "underscore":
/*!*****************************!*\
  !*** external "underscore" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"underscore\");\n\n//# sourceURL=webpack:///external_%22underscore%22?");

/***/ })

/******/ });