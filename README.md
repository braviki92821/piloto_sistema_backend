# Sistema de Carga de Datos del S2 y S3 - Frontend

Este sistema está diseñado para la carga y administración de datos del Sistema de Servidores Públicos que Intervienen en Procedimientos de Contratación (S2) y el Sistema de los Servidores Públicos y Particulares Sancionados (S3)

El sistema de carga de datos  permite a los generadores de datos transferir a las Secretarías Ejecutivas Anticorrupción Estatales los datos de los sistemas 2 y 3, que serán consultados desde la PDN a través de los mecanismos de comunicación desarrollados.

Por su parte, las Secretarías Ejecutivas Anticorrupción Estatales fungirán dentro del sistema como entidades concentradoras de los datos, sin embargo, el control y administración de los mismos será responsabilidad de los generadores/proveedores de datos.

## Tecnologías utilizadas

|Tecnología|Versión|Descripción|
|----------------|-------------------------------|--------------------------------------------------------------|
|Node.js|12.18.2|Entorno base de JavaScript, se usa como motor de ejecución para otras tecnologías del proyecto.|
|Webpack|4.17.2|Empaquetador de módulos.|
|Babel|7.0.0|Herramienta que nos permite transformar el código JS|
|Mongoose|5.9.26|Funciona como biblioteca para realizar la conexión e interacción con la base de datos.|

## Primeros pasos

### Descargar repositorio
```bash
git clone https://github.com/PDNMX/piloto_sistema_backend.git
```

### Variables de entorno
```bash
vim .env
```
```bash
USERMONGO=admonP2
PASSWORDMONGO=<password>
HOSTMONGO=<IP_HOST>:27017
DATABASE=administracionUsuarios
SEED=<seed>

EMAIL=<correo_electronico>
PASS_EMAIL=<password_correo_electronico>
HOST_EMAIL=<servidor smtp>
```

### Archivo docker-compose.yml, para agregar junto a los demás servicios

Si está siguiendo la guía puede deberá agregar la siguiente sección a su archivo docker-compose.yml general.

```YAML
  backend:
	restart: always
	container_name: backend
	build:
  	  context: piloto_sistema_backend
  	  dockerfile: Dockerfile
	ports:
  	- 3004:3004
```

### Archivo docker-compose.yml, para usar de forma independiente
Si lo que desea es hacer un despliegue independiente puede crear un archivo docker-compose.yml dentro de la carpeta del código.
```YAML
version: '3.1'
services:
  backend:
	restart: always
	container_name: backend
	build:
  	  context: .
  	  dockerfile: Dockerfile
	ports:
  	- 3004:3004
```

### Construir el contenedor
```bash
docker-compose build backend
```

### Iniciar el contenedor
```bash
docker-compose up -d backend
```

### Consultar los logs
```bash
docker-compose logs -f backend
```
