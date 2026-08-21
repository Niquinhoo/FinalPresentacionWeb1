# Guía de defensa de Pediloo

## Objetivo de la exposición

Al terminar, los profesores deben poder reconstruir el recorrido de un dato desde una interacción en React hasta SQLite y de vuelta al render. La idea central es:

> React representa, Express valida y SQLite persiste.

La presentación no busca explicar cada archivo. Busca demostrar que las capas colaboran, que el contrato HTTP es visible en el código y que las reglas importantes se cumplen en el backend.

La guía extensa de la API queda como material de consulta en `presentacion/GUIA_ESTUDIO_API_PEDILOO.md`. Este documento es el guion para defender las diez diapositivas.

## Mapa rápido de la defensa

```text
React: evento, estado, efecto y router
        |
        | apiFetch + fetch + JSON + cookie
        v
HTTP: método, URI, headers, body y status
        |
        | Express: router -> controller -> service
        v
SQLite: producto, stock, orden y líneas
        |
        | res.json -> response.ok -> setProducts
        v
React vuelve a renderizar
```

Frase para repetir cuando haya que ordenar una respuesta:

> El router selecciona, el controller interpreta HTTP, el service aplica la regla y SQLite conserva la información.

## Plan de tiempo

| Diapositivas | Tema | Tiempo objetivo | Resultado que debe quedar |
| --- | --- | ---: | --- |
| 1-2 | Proyecto integrado y separación de procesos | 1:00 | React y Express son procesos distintos unidos por HTTP |
| 3 | Modelo mental de React | 0:50 | Estado y efectos producen una vista declarativa |
| 4-5 | Puente API completo | 1:20 | La intención sale como HTTP y vuelve como estado visible |
| 6 | REST y CRUD | 0:45 | Método, URI, JSON y status forman el contrato |
| 7 | Carrito, stock y compra | 1:00 | El precio se relee y la compra es transaccional |
| 8 | Problemática de infraestructura | 0:55 | SQLite local no equivale a persistencia compartida en serverless |
| 9 | Seguridad y límites | 0:45 | La identidad está resuelta; la autorización aún falta |
| 10 | Demo y cierre | 1:10 | Una operación permite defender todo el sistema |

Duración objetivo: entre 6 y 8 minutos. Si aparece una pregunta, se puede ampliar con la guía de API sin cargar las diapositivas de teoría adicional.

## Cómo presentar cada diapositiva

### 1. Portada: seguir el dato

**Idea:** Pediloo no es sólo una pantalla: es un recorrido entre cliente, servidor y persistencia.

**Qué decir:**

> Voy a defender el proyecto siguiendo el dato. Una acción empieza en React, cruza HTTP, Express aplica las reglas, SQLite conserva el resultado y la respuesta vuelve a producir una nueva vista.

**No decir:** una lista de tecnologías sin explicar su relación.

**Transición:**

> Para entender ese recorrido, primero hay que separar las dos aplicaciones.

### 2. Dos aplicaciones, un solo sistema

**Idea:** `reactfinal` y `Web-1` son procesos diferentes. No comparten funciones, imports ni memoria.

**Qué señalar:**

- `reactfinal` corre en el navegador y representa componentes.
- `Web-1` corre en Node.js y controla Express, sesiones, servicios y SQLite.
- La única frontera compartida es una URL HTTP con JSON.
- React no importa controllers ni abre `database.db`.

**Evidencia:**

- Cliente: `F:\Escritorio\reactfinal\src\utils\api.ts:1,33-58`.
- Servidor: `F:\Escritorio\Web-1\app.js:32-44,66-78`.
- Base: `F:\Escritorio\Web-1\db\database.js:7-20`.

**Frase de defensa:**

> SQLite es la fuente de verdad del servidor; React sólo conoce el contrato HTTP que le permite pedir y enviar datos.

**Transición:**

> Una vez separadas las aplicaciones, podemos ver qué hace React con una interacción antes de llamar a la API.

### 3. React convierte interacción en una vista

**Idea:** React combina composición, estado, eventos, efectos y rutas para mantener la interfaz sincronizada.

**Qué explicar:**

1. Los componentes reciben datos y componen la interfaz.
2. El estado cambia cuando el usuario interactúa.
3. Los formularios controlados reflejan el valor de React en cada input.
4. `useEffect` sincroniza una fuente externa, en este caso la API.
5. React Router decide qué pantalla representar sin recargar el documento.

**Código que se puede leer:**

```tsx
const data = await apiFetch<Product[]>('/products');
if (Array.isArray(data)) {
  const normalized = data.map(p => ({
    ...p,
    status: normalizeStatus(p.status)
  }));
  setProducts(normalized);
```

Fuente exacta: `F:\Escritorio\reactfinal\src\pages\Products\ProductsList\ProductsList.tsx:102-129`.

**Punto teórico:** `setProducts` no modifica el DOM manualmente. Actualiza estado y React vuelve a renderizar la parte afectada.

**Pregunta probable:** ¿Por qué `useEffect` y no una llamada durante el render?

**Respuesta:** porque pedir datos es un efecto externo. El render debe describir la vista; el efecto sincroniza esa vista con la red.

**Transición:**

> Ese efecto llama a `apiFetch`. La siguiente diapositiva muestra cómo una intención se convierte en una request HTTP real.

### 4. Puente API, ida: intención a HTTP

**Idea:** `apiFetch` centraliza la frontera entre el navegador y Express.

**Recorrido oral:**

```text
evento o useEffect
 -> apiFetch('/products')
 -> API_BASE_URL + endpoint
 -> fetch(url, options)
 -> HTTP hacia /api/products
```

**Qué explicar al señalar el código:**

- `API_BASE_URL` vale por defecto `http://localhost:3000/api`.
- El endpoint `'/products'` completa la URI `/api/products`.
- Si hay un body string, se agrega `Content-Type: application/json`.
- `credentials: 'include'` permite que el navegador envíe la cookie de sesión.
- Se lee el texto, se parsea JSON y se rechaza cualquier status fuera de `2xx`.

**Código exacto resumido:**

```ts
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  ...options,
  headers,
  credentials: 'include',
});
const text = await response.text();
const data = text ? JSON.parse(text) as unknown : null;
```

Fuente exacta: `F:\Escritorio\reactfinal\src\utils\api.ts:33-58`.

**Aclaración importante:** la cookie `httpOnly` viaja con el navegador, pero JavaScript no puede leer su contenido. React no necesita leerla para que el servidor reconozca la sesión.

**Pregunta probable:** ¿Qué hace CORS aquí?

**Respuesta:** CORS permite que el navegador acepte respuestas del origen del servidor. No reemplaza autenticación ni autorización.

**Transición:**

> La request ya cruzó la frontera. Ahora sigue la cadena del servidor y el regreso de la respuesta.

### 5. Puente API, vuelta: Express a React

**Idea:** el backend procesa la request por capas y la respuesta vuelve hasta el estado que React renderiza.

**Recorrido de entrada:**

```text
/api/products
 -> router
 -> productsApiController.getAll
 -> productsService.getAllProducts
 -> SELECT en SQLite
```

**Recorrido de regreso:**

```text
SQLite
 -> service devuelve filas
 -> res.json()
 -> response.ok
 -> setProducts
 -> render
```

**Evidencia:**

- Router: `F:\Escritorio\Web-1\routes\api.router.js:16-20`.
- Controller: `F:\Escritorio\Web-1\controllers\api\productsApiController.js:73-108`.
- Service: `F:\Escritorio\Web-1\services\productsService.js:22-40`.
- Cliente: `F:\Escritorio\reactfinal\src\pages\Products\ProductsList\ProductsList.tsx:106-112`.

**POST breve para demostrar escritura:**

```js
const result = db.prepare(`
    INSERT INTO products (title, description, price, src, category, isTopSeller, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
    productData.title,
    productData.description,
    productData.price,
    productData.src,
    productData.category,
    productData.isTopSeller ? 1 : 0,
    productData.stock
);
```

Los `?` separan los valores de la estructura SQL. La respuesta final es `201 Created` con el producto releído.

**Frase de defensa:**

> El controller conoce HTTP; el service conoce la regla y SQL. Esa separación permite reutilizar la lógica sin duplicar consultas.

**Criterio principal:** estas dos diapositivas deben poder explicarse en menos de un minuto como un solo circuito.

### 6. REST y CRUD forman el contrato

**Idea:** el recurso es `products`, el método expresa la intención y el status comunica el resultado.

| Método | URI real | Intención | Estados clave |
| --- | --- | --- | --- |
| `GET` | `/api/products` | leer | `200` |
| `POST` | `/api/products` | crear | `201`, `400` |
| `PUT` | `/api/products/:id` | actualizar | `200`, `404` |
| `DELETE` | `/api/products/:id` | eliminar | `200`, `404` |

**Qué aclarar:**

- Frontend valida para dar feedback rápido.
- Backend vuelve a validar porque cualquier cliente puede llamar la API.
- `400` significa dato inválido.
- `404` significa recurso ausente.
- `409` significa conflicto con el estado actual, por ejemplo stock insuficiente.
- Pediloo usa estilo REST, pero no es completamente stateless porque sesión y carrito viven en el servidor.

**Pregunta probable:** ¿Por qué no se dice simplemente “es REST”?

**Respuesta:** porque usa recursos y verbos REST, pero `cookie-session` conserva el identificador y el carrito entre requests. La descripción precisa es “API HTTP de estilo REST con sesión basada en cookie”.

### 7. La regla de negocio está en la compra

**Idea:** el carrito guarda sólo intención mínima; el servidor relee precio y stock y confirma todo dentro de una transacción.

**Tres reglas para memorizar:**

1. La sesión conserva `{ productId, quantity }`.
2. Precio, título y stock se releen desde SQLite.
3. El stock baja al confirmar el pedido, no al agregar al carrito.

**SQL exacto:**

```js
const reduceStock = db.prepare(`
  UPDATE products SET stock = stock - ?
  WHERE id = ? AND stock >= ?
`);
```

Fuente: `F:\Escritorio\Web-1\services\ordersService.js:73-82`.

**Qué sigue en el service:**

```js
const stockResult = reduceStock.run(item.quantity, item.productId, item.quantity);
if (stockResult.changes !== 1) {
    throw Object.assign(new Error(`Stock insuficiente para ${item.title}`), { statusCode: 409 });
}
```

La transacción agrupa cabecera de orden, descuento de stock e inserción de líneas. Si una línea falla, SQLite revierte la operación completa. El carrito se vacía sólo después del commit.

**Pregunta probable:** ¿por qué no reservar stock al agregar al carrito?

**Respuesta:** porque el carrito representa intención y puede quedar abandonado. El inventario se modifica en el momento de confirmar la compra.

### 8. Problemática de infraestructura: SQLite no es un almacén compartido

**Idea:** el `INSERT` puede estar bien y aun así la aplicación no mostrar el dato de forma consistente cuando el despliegue reparte requests entre instancias.

**La decisión que explica el síntoma está en la API:**

```js
const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : process.env.VERCEL
        ? path.join('/tmp', 'pediloo-database.db')
        : path.join(__dirname, 'database.db');
```

Fuente: `F:\Escritorio\Web-1\db\database.js:7-12`.

**Qué ocurre en cada entorno:**

- En local, el proceso abre `db/database.db`. El `POST` de producto o categoría y el `GET` posterior leen el mismo archivo.
- En Vercel, `VERCEL` hace que la API use `/tmp`. Ese directorio es local a la instancia y puede desaparecer al reiniciar o al terminar el proceso.
- Si el `POST` cae en la instancia A y el siguiente `GET` en la instancia B, B puede no conocer el registro creado por A.
- El `bootstrap` puede volver a crear el esquema y cargar seed en una instancia nueva. Por eso el dato puede parecer “demorado”, desaparecer entre sesiones o volver al catálogo inicial.

**Hay un segundo factor de presentación:**

- `apiFetch` no agrega `cache: 'no-store'` ni un control explícito equivalente.
- Productos y categorías se cargan dentro de un `useEffect` al montar la pantalla; no existe una invalidación global después de cada alta.
- Eso puede dejar una vista anterior hasta recargar o volver a pedir la colección, pero no corrige el problema principal de almacenamiento distribuido.

**Ejemplo para anticipar en la defensa:**

```text
POST /api/categories       -> 201 + categoría nueva (instancia A)
cerrar/abrir otra sesión
GET  /api/categories       -> lista anterior (instancia B o caché)
```

La prueba no debe presentarse como una falla garantizada en cada request: depende de qué instancia atienda la petición. La conclusión correcta es que el diseño no ofrece una fuente de verdad compartida en serverless.

**Respuesta corta para decir:**

> SQLite no está tardando en ejecutar el `INSERT`. El problema es de infraestructura: en Vercel el archivo está en `/tmp`, cada instancia puede tener una copia diferente y la interfaz además necesita invalidar o releer la lista después de crear.

**Resolución recomendada:**

- Para una API en un único servidor persistente, SQLite puede seguir funcionando con disco durable.
- Para serverless, usar una base compartida y persistente, por ejemplo Turso/libSQL, Postgres, Neon, Supabase o Vercel Postgres.
- Agregar `Cache-Control: no-store` en lecturas dinámicas y volver a consultar productos/categorías después de un `POST`, `PUT` o `DELETE`.
- No alcanza con apuntar a `database.db` dentro del repositorio: el filesystem del despliegue no es una base compartida entre instancias.

### 9. Seguridad resuelta y límites conocidos

**Lo que sí está resuelto:**

- sal aleatoria y `scrypt` para contraseñas;
- comparación con `timingSafeEqual`;
- `publicUser` evita devolver `password_hash`;
- cookie de sesión `httpOnly`.

Fuentes: `F:\Escritorio\Web-1\services\usersService.js:4-40` y `F:\Escritorio\Web-1\app.js:35-44`.

**Distinción que hay que decir con claridad:**

> Autenticar identifica quién es la persona. Autorizar decide qué puede hacer.

Pediloo autentica, pero todavía faltan guards de sesión y rol en varios CRUD. Es una limitación conocida, no algo que convenga ocultar.

**Límites centrales:**

- fallback del secreto de sesión escrito en el código;
- `cookie-session` guarda el estado firmado en la cookie y tiene límites de tamaño;
- SQLite en `/tmp` al desplegar en Vercel;
- categorías relacionadas por nombre y no por foreign key;
- falta de autorización por rol.

**Pregunta probable:** ¿la cookie `httpOnly` hace segura toda la aplicación?

**Respuesta:** protege la lectura de la cookie desde JavaScript, pero no reemplaza autorización, gestión de secretos ni una política completa de seguridad.

### 10. Demostración y cierre

**Idea:** una operación observable reúne React, HTTP, reglas de negocio y persistencia.

La secuencia que aparece en la diapositiva es:

```text
crear producto con stock 2
 -> agregar una unidad
 -> agregar una segunda unidad
 -> intentar una tercera: 409
 -> comprar con DESCUENTO10
 -> releer stock: 0
```

**Qué cerrar diciendo:**

> La demo muestra que React no inventa el resultado: la interfaz inicia la operación, Express valida, SQLite decide y React representa el estado que vuelve.

No agregues una diapositiva de resumen. La frase final ya está en pantalla:

> React representa. Express valida. SQLite persiste.

## Demostración recomendada, paso a paso

### Preparación segura

Usar una base temporal para no alterar datos de trabajo. En una terminal de `Web-1`:

```powershell
$env:DATABASE_PATH = Join-Path $env:TEMP 'pediloo-defense.db'
Remove-Item -LiteralPath $env:DATABASE_PATH -Force -ErrorAction SilentlyContinue
npm start
```

En otra terminal, abrir la presentación:

```powershell
cd F:\Escritorio\FinalPresentacionWeb1
npm run dev
```

La API queda en `http://localhost:3000` y la presentación normalmente en `http://localhost:5173`.

Antes de la defensa, dejar listas tres ventanas:

1. navegador con la presentación;
2. navegador o DevTools con la app React;
3. terminal de la API.

### Demo A: probar el puente con una lectura

Esta es la demo más corta y estable.

1. Abrir la pantalla de productos del frontend.
2. Recargar con DevTools en la pestaña Network.
3. Seleccionar `GET http://localhost:3000/api/products`.
4. Mostrar status `200` y la respuesta JSON.
5. Volver a la diapositiva 4 y señalar `apiFetch`.
6. Volver a la diapositiva 5 y seguir `router -> controller -> service -> SQLite -> setProducts`.

**Qué demuestra:** separación de procesos, contrato HTTP, JSON, `response.ok` y nuevo render.

### Demo B: conflicto de stock y compra

Esta es la demo principal de la diapositiva 9. Usar `curl.exe`, que ya está disponible en Windows. El valor `$productId` se reemplaza con el ID que devuelva el alta.

```powershell
$base = 'http://localhost:3000'
$origin = 'http://localhost:5173'
$cookie = Join-Path $env:TEMP 'pediloo-defense-cookie.txt'
Remove-Item -LiteralPath $cookie -Force -ErrorAction SilentlyContinue

# 1. Login para hacer visible la sesión y la cookie
curl.exe -s -c $cookie -b $cookie `
  -H "Origin: $origin" -H 'Content-Type: application/json' `
  -d '{"email":"admin@pediloo.local","password":"Admin123!"}' `
  "$base/api/auth/login"

# 2. Crear un producto con stock 2 y copiar su id
curl.exe -s -c $cookie -b $cookie `
  -H "Origin: $origin" -H 'Content-Type: application/json' `
  -d '{"title":"Demo stock 2","description":"Prueba de defensa","price":100,"category":"Alimentos","stock":2}' `
  "$base/api/products"

$productId = 31

# 3. Agregar una unidad y luego una segunda
curl.exe -s -c $cookie -b $cookie `
  -H "Origin: $origin" -H 'Content-Type: application/json' `
  -d "{\"productId\":$productId}" "$base/api/cart/items"

curl.exe -s -c $cookie -b $cookie `
  -H "Origin: $origin" -H 'Content-Type: application/json' `
  -d '{"delta":1}' "$base/api/cart/items/$productId"

# 4. Intentar una tercera unidad: debe devolver HTTP 409
curl.exe -i -s -c $cookie -b $cookie `
  -H "Origin: $origin" -H 'Content-Type: application/json' `
  -d '{"delta":1}' "$base/api/cart/items/$productId"

# 5. Comprar con descuento
curl.exe -s -c $cookie -b $cookie `
  -H "Origin: $origin" -H 'Content-Type: application/json' `
  -d '{"discountCode":"DESCUENTO10"}' "$base/api/orders"

# 6. Releer el producto: el stock debe ser 0
curl.exe -s -c $cookie -b $cookie "$base/api/products/$productId"
```

**Qué observar:**

- el alta devuelve `201`;
- el carrito llega a cantidad `2`;
- el tercer incremento devuelve `409`;
- el pedido devuelve `201`, descuento del `10%` y estado `Recibido`;
- el producto releído queda con stock `0`;
- la transacción evita una compra parcial.

**Importante:** `31` es el ID esperado sólo en una base temporal recién creada con los 30 productos seed. Siempre usar el ID real devuelto por el primer `curl`.

### Demo C: evidencia reproducible de integración

Si la demostración manual falla por red, puertos o navegador, ejecutar en `F:\Escritorio\Web-1`:

```powershell
npm test
```

El test crea una SQLite temporal, inicia Express en un puerto libre, conserva la cookie entre requests y cubre:

- preflight CORS;
- catálogo, búsqueda y orden;
- CRUD de categorías y productos;
- registro y login;
- usuario público sin hash;
- carrito y pedido con descuento;
- cambio de estado;
- vaciado del carrito;
- estadísticas y rutas 404.

Resultado esperado:

```text
tests 1
pass 1
fail 0
```

Esta prueba es evidencia de integración, no una prueba unitaria aislada: usa HTTP, Express, sesión, services y SQLite real.

## Qué no conviene demostrar en vivo

- No editar archivos durante la defensa.
- No borrar la base de datos real del proyecto.
- No depender de imágenes externas o de una conexión a Internet.
- No intentar mostrar todos los endpoints.
- No prometer autorización por rol si todavía faltan guards.
- No presentar el estado `409` como un error inesperado: es la respuesta correcta ante un conflicto de stock.

## Preguntas probables y respuestas breves

### ¿Por qué React no accede directamente a SQLite?

Porque corre en otro proceso y en otro contexto de seguridad. React consume una API; el servidor protege la base y concentra las reglas.

### ¿Dónde se agrega `/api`?

En `API_BASE_URL`, cuyo valor por defecto es `http://localhost:3000/api`. `apiFetch('/products')` completa la URL sin repetir el prefijo.

### ¿Qué hace `credentials: 'include'`?

Indica al navegador que incluya la cookie de sesión en la request. La cookie es `httpOnly`, por eso React no la lee directamente.

### ¿Por qué validar dos veces?

El frontend valida para mejorar la experiencia. El backend valida porque el cliente no es confiable y puede existir otra aplicación llamando la API.

### ¿Qué diferencia hay entre `400` y `409`?

`400` es una request mal formada o con datos inválidos. `409` es una request válida que choca con el estado actual, como intentar comprar más stock del disponible.

### ¿Cuándo se descuenta el stock?

Al confirmar el pedido, dentro de la transacción. Agregar al carrito sólo cambia la sesión.

### ¿Por qué la condición `stock >= quantity` es importante?

Porque comprueba y descuenta en la misma instrucción SQL. Si no afecta exactamente una fila, el service lanza `409` y la transacción revierte.

### ¿La API es stateless?

No completamente. Tiene recursos y verbos REST, pero sesión y carrito conservan estado en el servidor.

### ¿La contraseña vuelve en el JSON?

No. `publicUser` construye un objeto público que omite `password_hash`.

### ¿Hay autorización de administrador?

Todavía no de forma completa. El sistema identifica usuarios y guarda el rol, pero faltan guards que restrinjan los endpoints sensibles.

## Checklist de estudio

Antes de exponer, poder responder sin mirar:

- [ ] ¿Cuál es la frase central de la presentación?
- [ ] ¿Qué diferencia a `reactfinal` de `Web-1`?
- [ ] ¿Qué hace un componente, un estado, un evento y un efecto?
- [ ] ¿Cómo se construye `/api/products` desde `apiFetch`?
- [ ] ¿Qué diferencia hay entre router, controller y service?
- [ ] ¿Qué significan `200`, `201`, `400`, `404` y `409`?
- [ ] ¿Qué vive en la sesión y qué vive en SQLite?
- [ ] ¿Por qué el stock no baja al agregar al carrito?
- [ ] ¿Qué garantiza la transacción del pedido?
- [ ] ¿Qué resuelve `scrypt`, `timingSafeEqual` y `httpOnly`?
- [ ] ¿Qué límites actuales se reconocen?
- [ ] ¿Puedo ejecutar `npm test` y explicar qué integra?

## Cierre de 20 segundos

> Pediloo separa responsabilidades sin perder el flujo: React captura la interacción y representa estado; `apiFetch` la convierte en HTTP; Express enruta y valida; los services aplican reglas; SQLite persiste. En la compra, el servidor relee precio y stock, usa una transacción y devuelve un resultado verificable. Por eso la frase final es literal: React representa, Express valida y SQLite persiste.

## Fuentes de código

- Cliente: `F:\Escritorio\reactfinal\src\utils\api.ts`.
- React: `F:\Escritorio\reactfinal\src\pages\Products\ProductsList\ProductsList.tsx` y `ProductView\ProductView.tsx`.
- Montaje HTTP: `F:\Escritorio\Web-1\app.js`.
- Rutas: `F:\Escritorio\Web-1\routes\api.router.js`.
- Controllers: `F:\Escritorio\Web-1\controllers\api\`.
- Servicios: `F:\Escritorio\Web-1\services\`.
- Persistencia: `F:\Escritorio\Web-1\db\schema.sql` y `db\database.js`.
- Prueba reproducible: `F:\Escritorio\Web-1\test\api.test.js`.
- Material teórico: `F:\Escritorio\TeoriaReact\T6\Peticiones.md` y la guía `presentacion\GUIA_ESTUDIO_API_PEDILOO.md`.
