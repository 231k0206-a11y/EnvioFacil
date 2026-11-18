# Reporte de Arquitectura y Construcción de Software \- EnvioFacil

## 1\. Datos del equipo

&nbsp;

* **Integrantes:**  
  * Eduardo Hernández Sanabria&nbsp;  
  * Miguel Alejandro Puc Nahuat  
  * Ricardo José Acosta Alcocer  
  * Gabriela Che Sansores  
* **Stack Tecnológico Elegido:** Node.js / TypeScript 
* **Asistente(s) de IA Utilizados:** Gemini 3 Flash  
* **Historia(s) de Usuario Atendida(s):**  Actualización y validación de estados de envíos y reglas de cancelación.

---

## 2\. Bitácora de prompts

### Prompt Principal de Contextualización

> **Copia fiel del prompt enviado a la IA:**  
> *"Actúa como un Arquitecto de Software Senior. A partir del siguiente contrato OpenAPI YAML y los escenarios Gherkin para la plataforma EnvioFacil, genera la estructura de carpetas y clases aplicando Arquitectura Limpia (Clean Architecture). Separa estrictamente Dominio, Aplicación e Infraestructura, implementando el endpoint PATCH para actualizar el estado de un envío y manejando los códigos HTTP 200, 400, 404 y 409."*

### Auditoría

A continuación se describen los errores arquitectónicos, de desacoplamiento o de implementación detectados durante la generación asistida y cómo fueron corregidos:

1. **Error detectado:** La IA mezcló librerías HTTP/ORM dentro del archivo de la Entidad de Dominio o acopló respuestas HTTP directamente en el caso de uso.

   * **Solución aplicada:** Se eliminó la dependencia externa de la capa de Dominio (`src/domain`), dejando la entidad `Envio` pura con sus reglas de negocio, y se movió el contrato de persistencia a una interfaz en la capa de Aplicación (`src/aplication`).  
2. **Error detectado:** Desajuste en el contrato de datos (DTO) entre la capa de Infraestructura y el Caso de Uso (`EnvioController` extraía `estado_orden` del `req.body` en lugar de `nuevo_estado`), además de llaves duplicadas en `ActualizarEstadoEnvioUseCase.ts` que impedían capturar la regla de negocio `409 Conflict` cuando el paquete ya estaba en ruta (`OUT_FOR_DELIVERY`).

   * **Solución aplicada:** Se estandarizó la desestructuración del cuerpo de la petición en `EnvioController.ts` para leer `nuevo_estado`, `usuario_id` y `motivo_cancelacion`, y se refactorizó el bloque condicional de `ActualizarEstadoEnvioUseCase.ts` para validar primero el estado `'OUT_FOR_DELIVERY'` antes de permitir la cancelación, mapeando las excepciones del dominio a los códigos HTTP `409`, `400` y `404` en el controlador.

---

## 3\. Estructura del Repositorio

```
src/
├── domain/                  # Entidades puras (Envio) y reglas de negocio (EstadoEnvio)
├── aplication/              # Casos de Uso (ActualizarEstadoEnvioUseCase) y Puertos (Interfaces)
└── infraestructura/         # Controladores HTTP (EnvioController) y Repositorio en Memoria (InMemoryEnvioRepository)
```

---

## 4\. Matriz de Evidencias de Pruebas API (Thunder Client)

A continuación se documentan las ejecuciones de prueba realizadas vía **Thunder Client** para validar el comportamiento del endpoint `PATCH /api/v1/envios/{id}/estado` y sus códigos de respuesta HTTP.

### 4.1. Caso Exitoso: Actualización de Estado (`200 OK`)

Se actualiza el estado de una orden existente cumpliendo el flujo habitual del ciclo de vida.

* **Método HTTP:** `PATCH`  
* **URL:** `http://localhost:3000/api/v1/envios/EF-3001/estado`  
* **Headers:** `Content-Type: application/json`

**Cuerpo de la Petición (Request Body):**

```json
{
  "nuevo_estado": "DELIVERED",
  "usuario_id": 101
}
```

**Respuesta del Servidor (Response Body):**

```json
{
  "mensaje": "Estado actualizado con éxito",
  "orden_id": "EF-3001"
}
```

* **Código de Estado HTTP:** `200 OK`

---

### 4.2. Caso Regla de Negocio: Intento de Cancelación en Ruta (`409 Conflict`)

Se intenta cancelar la orden `EF-3002` que se encuentra previamente en estado `'OUT_FOR_DELIVERY'`. El dominio bloquea la transición.

* **Método HTTP:** `PATCH`  
* **URL:** `http://localhost:3000/api/v1/envios/EF-3002/estado`  
* **Headers:** `Content-Type: application/json`

**Cuerpo de la Petición (Request Body):**

```json
{
  "nuevo_estado": "CANCELLED",
  "usuario_id": 102,
  "motivo_cancelacion": "Cliente ausente"
}
```

**Respuesta del Servidor (Response Body):**

```json
{
  "codigoError": "CONFLICT_SHIPPING_IN_ROUTE",
  "mensaje": "No se puede cancelar: el envío ya está en ruta"
}
```

* **Código de Estado HTTP:** `409 Conflict`

---

### 4.3. Caso Datos Incompletos: Solicitud Mal Formada (`400 Bad Request`)

Se solicita la cancelación de un paquete sin proporcionar el `usuario_id` ni el `motivo_cancelacion` requeridos.

* **Método HTTP:** `PATCH`  
* **URL:** `http://localhost:3000/api/v1/envios/EF-3001/estado`  
* **Headers:** `Content-Type: application/json`

**Cuerpo de la Petición (Request Body):**

```json
{
  "nuevo_estado": "CANCELLED"
}
```

**Respuesta del Servidor (Response Body):**

```json
{
  "codigoError": "BAD_REQUEST",
  "mensaje": "usuario_id y motivo_cancelacion son obligatorios para cancelar"
}
```

* **Código de Estado HTTP:** `400 Bad Request`

---

### 4.4. Caso Recursos No Encontrados (`404 Not Found`)

Se realiza una solicitud especificando un identificador de paquete inexistente en el sistema.

* **Método HTTP:** `PATCH`  
* **URL:** `http://localhost:3000/api/v1/envios/EF-9999/estado`  
* **Headers:** `Content-Type: application/json`

**Cuerpo de la Petición (Request Body):**

```json
{
  "nuevo_estado": "DELIVERED",
  "usuario_id": 101
}
```

**Respuesta del Servidor (Response Body):**

```json
{
  "codigoError": "NOT_FOUND",
  "mensaje": "Orden no encontrada"
}
```

* **Código de Estado HTTP:** `404 Not Found`
