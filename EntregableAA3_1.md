## 1. Resumen Ejecutivo y Arquitectura

El presente documento detalla la implementación y validación de endpoints de la API REST para el módulo de actualización de estados de envíos de la plataforma EnvioFacil. 

El software fue construido aplicando Arquitectura Limpia en Node.js con TypeScript con los siguientes elementos:

Capa de Dominio : Define las entidades core como `Envio`, las reglas de negocio estrictas para transiciones de estado y los tipos del dominio (`EstadoEnvio`: `'RECEIVED'`, `'PREPARING'`, `'OUT_FOR_DELIVERY'`, `'DELIVERED'`, `'CANCELLED'`).

Capa de Aplicación (`src/aplication`): Alberga los casos de uso (`ActualizarEstadoEnvioUseCase`), orquestando la lógica de negocio y aplicando las validaciones requeridas antes de llamar a la capa de persistencia.

Capa de Infraestructura (`src/infraestructura`): Implementa los controladores Express (`EnvioController`), el mapeo de errores del dominio a respuestas HTTP estandarizadas y el repositorio de persistencia temporal en memoria (`InMemoryEnvioRepository`).



## 2. Definición del Dominio y Reglas de Negocio

La entidad `Envio` administra el ciclo de vida del paquete y restringe el comportamiento del sistema bajo las siguientes directrices:


1. Validación de Cancelaciones (`400 Bad Request`)**: La cancelación de una orden exige obligatoriamente los campos `usuario_id` y `motivo_cancelacion`.

2. Regla de Conflicto de Ruta (`409 Conflict`)**: Un paquete en estado `'OUT_FOR_DELIVERY'` (en ruta) no puede ser cancelado. Intentar esta operación genera una excepción de regla de negocio que se traduce en un código de estado `409`.

3. Recuperación de Entidades (`404 Not Found`)**: Peticiones sobre identificadores inexistentes en la base de datos o en memoria devuelven la falla correspondiente.



## 3. Matriz de Evidencias de Pruebas API en Thunder Client


### 3.1. Caso Exitoso: Actualización de Estado (200 OK)

Se actualiza el estado de una orden existente cumpliendo el flujo habitual del ciclo de vida.

Método HTTP: `PATCH`
**URL**: `http://localhost:3000/api/v1/envios/EF-3001/estado`
Headers: `Content-Type: application/json`

Cuerpo de la Petición (Request Body):

{
  "nuevo_estado": "DELIVERED",
  "usuario_id": 101
}


Respuesta del Servidor (Response Body):
{
  "mensaje": "Estado actualizado con éxito",
  "orden_id": "EF-3001"
}


 Código de Estado HTTP: `200 OK`

---

### 3.2. Caso Regla de Negocio: Intento de Cancelación en Ruta (409 Conflict)

Se intenta cancelar la orden `EF-3002` que se encuentra previamente en estado `'OUT_FOR_DELIVERY'`. El dominio bloquea la transición.

Método HTTP: `PATCH`
URL: `http://localhost:3000/api/v1/envios/EF-3002/estado`
Headers: `Content-Type: application/json`

Cuerpo de la Petición (Request Body):

{
  "nuevo_estado": "CANCELLED",
  "usuario_id": 102,
  "motivo_cancelacion": "Cliente ausente"
}


Respuesta del Servidor (Response Body):

{
  "codigoError": "CONFLICT_SHIPPING_IN_ROUTE",
  "mensaje": "No se puede cancelar: el envío ya está en ruta"
}

Código de Estado HTTP**: `409 Conflict`



### 3.3. Caso Datos Incompletos: Solicitud Mal Formada (400 Bad Request)

Se solicita la cancelación de un paquete sin proporcionar el `usuario_id` ni el `motivo_cancelacion` requeridos.

Método HTTP: `PATCH`
URL: `http://localhost:3000/api/v1/envios/EF-3001/estado`
Headers: `Content-Type: application/json`

Cuerpo de la Petición (Request Body):

{
  "nuevo_estado": "CANCELLED"
}


Respuesta del Servidor (Response Body):

{
  "codigoError": "BAD_REQUEST",
  "mensaje": "usuario_id y motivo_cancelacion son obligatorios para cancelar"
}

Código de Estado HTTP: `400 Bad Request`



### 3.4. Caso Recursos No Encontrados (404 Not Found)

Se realiza una solicitud especificando un identificador de paquete inexistente en el sistema.

Método HTTP: `PATCH`
URL: `http://localhost:3000/api/v1/envios/EF-9999/estado`
Headers: `Content-Type: application/json`

Cuerpo de la Petición (Request Body):

{
  "nuevo_estado": "DELIVERED",
  "usuario_id": 101
}


Respuesta del Servidor (Response Body):

{
  "codigoError": "NOT_FOUND",
  "mensaje": "Orden no encontrada"
}

Código de Estado HTTP: `404 Not Found`



## 4. Conclusiones

La estructuración del proyecto mediante Arquitectura limpia permitió aislar completamente las reglas del negocio de los detalles de transporte de EnvioFacil. Las pruebas integradas mediante Thunder Client ratifican que los códigos HTTP emitidos reflejan adecuadamente la semántica de los resultados en la capa del dominio.