# FenixCMS SaaS — Informe de Auditoría de Seguridad, Persistencia y Arquitectura (Fase 1)

**Fecha:** 21 de Octubre de 2026  
**Entorno:** Fase 1 Ampliada — Transición a Fase 1 Bis  
**Rama objetivo:** `main`  
**Alcance:** Seguridad, Autenticación, PostgreSQL/Prisma, Sesiones, Esquema Relacional, Checkout Multi-Tenant y Permisos de API.

---

## 1. Resumen Ejecutivo de Riesgos Identificados

Durante la inspección del código fuente y la arquitectura de la Fase 1, se han detectado **7 riesgos críticos y de severidad alta** que impiden el paso seguro a producción y el avance hacia la Fase 2 sin remediación estricta:

| # | Área | Riesgo Detectado | Nivel de Severidad |
|---|---|---|---|
| **R1** | **Credenciales** | Credenciales precargadas en formulario `/superadmin/login` y tarjeta con contraseñas en claro. | **CRÍTICO** |
| **R2** | **Autenticación** | Excepciones de bypass con contraseñas alternativas codificadas en `lib/auth/passwords.ts`. | **CRÍTICO** |
| **R3** | **Persistencia** | Dependencia de arrays en memoria (`lib/db/repository.ts`) como fuente de verdad en lugar de PostgreSQL con Prisma. | **ALTO** |
| **R4** | **Sesiones** | Tokens de sesión almacenados en texto plano sin función hash unidireccional y sin tabla persistente. | **ALTO** |
| **R5** | **Esquema Relacional** | Uso de tipos flotantes (`Float` / `DOUBLE PRECISION`) para valores monetarios (precios, suscripciones, pagos). | **ALTO** |
| **R6** | **Checkout E-Commerce** | Confianza ciega en `totalAmount`, precios y cantidades enviados desde el navegador; sin recálculo ni transacción atómica. | **CRÍTICO** |
| **R7** | **Aislamiento Multi-Tenant** | Ausencia de verificación de tenant en endpoints de tienda y pedidos marcados como `COMPLETED` sin verificación de pasarela. | **ALTO** |

---

## 2. Detalle de Vulnerabilidades y Hallazgos de Código

### 2.1. Credenciales Expuestas y Bypass en Autenticación (R1, R2)
* **Ubicación:** `app/superadmin/login/page.tsx` (líneas 12-13, 150-155) y `lib/auth/passwords.ts` (líneas 17-25).
* **Hallazgo:**
  * El estado de React inicializaba los campos con `admin@fenixcms.es` y `Admin123!*Fenix`.
  * La interfaz renderizaba un cuadro informativo visible con las credenciales de superadministrador.
  * La función `verifyPassword` contenía un condicional explícito que aceptaba `Admin123!`, `Admin123!Fenix` y omitía la verificación criptográfica estricta.
  * No existía rate limiting en el endpoint `POST /api/superadmin/auth`, permitiendo ataques de fuerza bruta.

### 2.2. Fuente de Verdad en Memoria vs PostgreSQL Real (R3)
* **Ubicación:** `lib/db/repository.ts`, `app/api/superadmin/*`, `app/api/store/*`.
* **Hallazgo:**
  * Todas las rutas de API operaban sobre una clase en memoria `FenixRepository` persistida en `global.fenixRepo`.
  * `@prisma/client` y `prisma` no estaban sincronizados ni existía cliente Prisma tipado (`lib/db/prisma.ts`).
  * En un despliegue multi-instancia (Cloud Run, Kubernetes) o tras reinicio del proceso, las mutaciones se pierden y la consistencia se corrompe.
  * Si PostgreSQL no está conectado, el sistema debe emitir errores controlados (503 Service Unavailable) en lugar de operar sobre arrays simulados.

### 2.3. Sesiones y Almacenamiento de Tokens (R4)
* **Ubicación:** `lib/auth/session.ts`.
* **Hallazgo:**
  * Los tokens de sesión se generaban (`fenix_` + randomBytes) y se almacenaban directamente en memoria en texto plano.
  * En caso de volcado de memoria o filtración, los tokens permiten secuestro de sesión inmediato.
  * El esquema Prisma posee la tabla `Session`, pero no se utilizaba. La sesión debe almacenar el hash SHA-256 del token y validar la vigencia, la revocación y el estado `ACTIVE` del usuario en PostgreSQL.

### 2.4. Inconsistencias en Esquema Prisma y Tipos Monetarios (R5)
* **Ubicación:** `prisma/schema.prisma` y `prisma/migrations/20261020_init/migration.sql`.
* **Hallazgo:**
  * Campos como `ModulePrice.price`, `DiscountRule.value`, `Subscription.price`, `SubscriptionItem.price`, `Payment.amount`, `PluginCatalogItem.price`, `ThemeCatalogItem.price` utilizaban `Float` / `DOUBLE PRECISION`.
  * Los tipos de coma flotante introducen imprecisiones binarias en operaciones aritméticas financieras (p.ej. 0.1 + 0.2 = 0.30000000000000004).
  * Deben ser declarados como `Decimal @db.Decimal(12, 2)` para garantizar precisión centesimal exacta.
  * La tabla `Payment` tenía `onDelete: Cascade` ante la eliminación de `Tenant`, lo que violaría normativas de conservación contable y auditoría fiscal. Debe utilizarse `onDelete: Restrict` o `SetNull`.
  * Las entidades de la tienda online (`StoreProduct`, `StoreOrder`, `StoreOrderItem`) presentes en memoria no estaban formalizadas en el esquema relacional Prisma ni en la migración SQL.

### 2.5. Checkout Inseguro y Riesgos de Manipulación (R6, R7)
* **Ubicación:** `app/api/store/checkout/route.ts`.
* **Hallazgo:**
  * El endpoint leía `totalAmount` directamente del cuerpo HTTP JSON sin recalcular importes contra la base de datos. Un atacante podía enviar `{ totalAmount: 0.01 }` y adquirir artículos de alto valor.
  * Los precios de cada línea (`item.price`) se recibían del cliente.
  * El `tenantId` estaba prefijado estáticamente a `'ten_latotaltienda'` en lugar de resolverse por dominio validado o contexto multitenant.
  * El pedido se creaba directamente con estado `COMPLETED` sin confirmación de pasarela de pago (Stripe, Redsys, etc.).
  * No existía clave de idempotencia (`idempotencyKey`) ni transacción atómica Prisma `$transaction` para descontar existencias de forma concurrente y segura.

---

## 3. Plan de Acción y Correcciones Obligatorias (Fase 1 Bis)

1. **Credenciales y Superadministrador:**
   * Limpiar formulario de login (inputs vacíos).
   * Eliminar tarjetas visuales con contraseñas.
   * Eliminar cualquier bypass en `lib/auth/passwords.ts`.
   * Crear script de inicialización seguro e idempotente (`scripts/bootstrap-superadmin.ts`) que lea `SUPERADMIN_EMAIL` y `SUPERADMIN_PASSWORD` desde variables de entorno.
   * Implementar limitador de tasa (rate limiter en memoria/servidor) por IP/email en `/api/superadmin/auth`.
   * Aplicar validación estricta de cambio obligatorio de contraseña (`mustChangePassword`).

2. **Capa Prisma y PostgreSQL:**
   * Crear cliente Prisma singleton (`lib/db/prisma.ts`) con gestión de desconexión y manejo de errores controlados (no fallback silencioso).
   * Actualizar `prisma/schema.prisma` convirtiendo `Float` a `Decimal(12, 2)`, protegiendo `Payment` y añadiendo modelos `StoreProduct`, `StoreOrder`, `StoreOrderItem`.
   * Generar migración incremental revisada en `prisma/migrations/20261021_production_hardening/migration.sql`.

3. **Sesiones Persistentes y Hasheadas:**
   * Guardar `tokenHash: sha256(token)` en PostgreSQL/Prisma.
   * Validar expiración, usuario activo y revocación en base de datos.
   * Cierre de sesión persistente.

4. **Checkout Seguro y Aislamiento Multi-Tenant:**
   * Recálculo obligatorio de precios e importes en servidor desde la base de datos.
   * Validación de cantidades enteras positivas y disponibilidad de stock.
   * Transacción atómica Prisma (`prisma.$transaction`) para reserva de stock y creación del pedido.
   * Idempotencia mediante clave única `idempotencyKey`.
   * Estado de pedido inicial en `PENDING` o `PAYMENT_PENDING`.

5. **Pruebas Automatizadas:**
   * Pruebas exhaustivas unitarias y de integración que verifiquen rechazo de contraseñas alternativas, recálculo de importes manipulados, sesiones hasheadas y aislamiento de tenants.
