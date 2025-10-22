# avi-backend: Motor Inteligente de Procesamiento y Automatización

Backend centralizado para gestionar flujos conversacionales, procesamiento de datos y automatización de tareas, utilizando Node.js, Express, PocketBase y Google Gemini.

## 🚀 Descripción General

Este proyecto actúa como el cerebro detrás de varias automatizaciones, incluyendo:

* **Recepción y Acumulación de Webhooks:** (Opcional, si usas el `accumulatorController`) Recibe notificaciones (ej., de Evolution API), agrupa mensajes por remitente y los reenvía.
* **Clasificación de Intenciones:** Utiliza Google Gemini (`aiService`) para entender la intención inicial del usuario (ej., préstamo, internet, saludo).
* **Máquina de Estados para Préstamos:** Gestiona el flujo conversacional completo para solicitudes de préstamos, recolectando datos de forma adaptativa.
* **Extracción de Datos con IA:** Usa Gemini (`aiService`) para extraer información estructurada (ciudad, barrio, referencias) de mensajes de texto libre.
* **API de Administración (CRUD):** Provee endpoints para crear, leer y actualizar registros (ej., solicitudes de préstamo) directamente en la base de datos PocketBase.

## 🏛️ Arquitectura

El proyecto sigue una arquitectura modular y separada por capas:

* **API (`src/api/`):** Define las rutas (endpoints) y los controladores que manejan las peticiones HTTP.
    * **Controllers:** Orquestan el flujo, llaman a los servicios y responden al cliente.
    * **Routes:** Mapean las URLs a los controladores.
* **Config (`src/config/`):** Contiene la configuración de conexión a servicios externos (ej., PocketBase).
* **FSM Configs (`src/fsm-configs/`):** Define las "reglas del juego" (orden de pasos, mapeo de handlers) para cada máquina de estados.
* **Repositories (`src/repositories/`):** Capa de acceso a datos. Único punto de contacto con la base de datos (PocketBase).
* **Services (`src/services/`):** Contiene la lógica de negocio principal (inteligencia artificial, validaciones, notificaciones, etc.).
* **State Handlers (`src/stateHandlers/`):** Implementa la lógica específica para cada estado de la máquina de estados.

## ✨ Características Principales

* Recepción de Webhooks (configurable).
* Clasificación de intenciones basada en IA (Gemini).
* Máquina de estados configurable y adaptativa para recolección de datos.
* Extracción de datos (ciudad, barrio, referencias) desde texto libre usando IA.
* Generación de direcciones de cruce aleatorias (si se extrae ciudad).
* Endpoints CRUD para gestión de registros (Upsert por teléfono, GET por teléfono/cédula).
* Integración con PocketBase como base de datos.
* Manejo de errores y logging detallado.

## 🛠️ Configuración e Instalación

**Pre-requisitos:**

* Node.js (v18 o superior recomendado)
* npm (usualmente viene con Node.js)
* Una instancia de PocketBase corriendo y accesible.
* Una API Key de Google Gemini.

**Pasos:**

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DE_TU_REPOSITORIO]
    cd avi-backend
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno:**
    * Crea un archivo `.env` en la raíz del proyecto (`avi-backend/.env`).
    * Copia el contenido de `.env.example` (si lo tienes) o añade las siguientes variables con tus valores:
        ```dotenv
        NODE_ENV=development # o production
        PORT=3001 # Puerto donde correrá esta API

        # PocketBase
        POCKETBASE_URL=https://[TU_INSTANCIA].easypanel.host/
        POCKETBASE_ADMIN_EMAIL=[TU_EMAIL_ADMIN_PB]
        POCKETBASE_ADMIN_PASSWORD=[TU_PASSWORD_ADMIN_PB]

        # Google Gemini
        GEMINI_API_KEY=AIzaSy...[TU_API_KEY]
        GEMINI_MODEL=gemini-pro # o el modelo que uses

        # (Opcional, para el acumulador)
        # ACCUMULATION_TIMEOUT_SECONDS=20
        # TARGET_N8N_URL=https://[TU_N8N]/webhook/...
        # HOST_IP=[IP_PUBLICA_DE_ESTE_SERVIDOR] 
        ```
4.  **Iniciar la aplicación:**
    ```bash
    node app.js
    ```
    O si usas un gestor como `pm2`:
    ```bash
    pm2 start app.js --name avi-backend
    ```

## 🌐 API Endpoints (Principales)

* `POST /api/loan/advance`: Procesa un paso en la máquina de estados de préstamos.
* `POST /api/loan/prestamos`: Crea o actualiza (Upsert) una solicitud de préstamo basado en `telefono_contacto`.
* `GET /api/loan/prestamos/telefono/existe/:telefono`: Verifica si existe una solicitud con ese teléfono (`{ exists: true/false }`).
* `GET /api/loan/prestamos/telefono/:telefono`: Obtiene o crea una solicitud por teléfono.
* `POST /api/session/recognize`: Reconoce la intención inicial de un mensaje usando IA.
* `POST /api/log/chat`: Guarda un mensaje de chat en la base de datos.
* `POST /accumulator/webhook`: (Si usas el acumulador) Recibe webhooks para acumular mensajes.

## 💻 Tecnologías Utilizadas

* Node.js
* Express.js
* PocketBase (SDK: `pocketbase/cjs`)
* Google Generative AI (`@google/generative-ai`)
* Axios
* Dotenv

---

*Este README fue generado con la ayuda de IA.*