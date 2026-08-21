# Guía de estudio de la API Pediloo

> Alcance: lógica backend de `F:\Escritorio\Web-1`.
> No estudia el frontend EJS ni la interfaz React, salvo para ubicar a la API como frontera del sistema.
> Verificación realizada el 13 de agosto de 2026 con `npm test`: 1 prueba integrada aprobada.

## 1. La idea que organiza toda la defensa

La API es el punto de entrada al negocio. Recibe una petición HTTP, decide qué operación corresponde, valida los datos, aplica reglas mediante servicios y persiste el resultado en SQLite.

```text
Petición HTTP
    -> middleware de Express
    -> router
    -> controller
    -> service
    -> SQLite o sesión
    -> JSON + estado HTTP
```

La frase más importante para memorizar es:

> El router selecciona, el controller interpreta HTTP, el service aplica lógica y SQLite conserva la información.

Fuentes principales:

- Montaje de la API: `F:\Escritorio\Web-1\app.js:32-44,66-78`.
- Contrato de rutas: `F:\Escritorio\Web-1\routes\api.router.js:12-52`.
- Controllers: `F:\Escritorio\Web-1\controllers\api\`.
- Services: `F:\Escritorio\Web-1\services\`.
- Esquema: `F:\Escritorio\Web-1\db\schema.sql:1-51`.

## 2. Cómo se aplica la teoría de API REST

La teoría explica que una API REST organiza el sistema alrededor de recursos identificados por URI. El verbo HTTP expresa la intención.

| Intención | Verbo | Ejemplo real | Resultado habitual |
| --- | --- | --- | --- |
| Consultar una colección | `GET` | `/api/products` | `200` + array JSON |
| Consultar un recurso | `GET` | `/api/products/:id` | `200` o `404` |
| Crear | `POST` | `/api/products` | `201` + objeto creado |
| Reemplazar datos editables | `PUT` | `/api/products/:id` | `200` + objeto actualizado |
| Eliminar | `DELETE` | `/api/products/:id` | `200` + mensaje |

Aplicación concreta:

- Las URI usan sustantivos como `products`, `categories`, `users` y `orders`.
- El mismo recurso cambia de acción según el método HTTP.
- Los datos se intercambian como JSON.
- Los estados HTTP informan el resultado de forma independiente del cuerpo.
- La API no renderiza vistas en `/api`; responde con `res.json()`.

Fuente teórica: `F:\Escritorio\TeoriaReact\T6\Peticiones.md`.

### Precisión importante: REST estricto y sesiones

REST estricto propone un servidor sin estado entre peticiones. Pediloo usa una interfaz REST para sus recursos, pero conserva `userId` y carrito en `cookie-session`. Por eso la descripción más exacta es:

> Es una API HTTP de estilo REST con sesión basada en cookie.

`cookie-session` serializa el objeto de sesión dentro de una cookie firmada. No es un `MemoryStore` de servidor y no cifra el contenido; `httpOnly` evita que JavaScript del navegador la lea. En este proyecto la cookie puede transportar `userId` y carrito, mientras que productos, categorías y pedidos siguen viviendo en SQLite.

Fuente: `F:\Escritorio\Web-1\app.js:35-44` y `F:\Escritorio\Web-1\services\cartService.js:3-9`.

## 3. Arquitectura por capas

### 3.1 `app.js`: infraestructura y orden de middlewares

`app.js` prepara la aplicación en este orden conceptual:

1. Crea Express.
2. Configura EJS y archivos estáticos para la parte legacy.
3. Activa `express.urlencoded()` y `express.json()`.
4. Activa la sesión.
5. Calcula un dato global del carrito para las vistas EJS.
6. Configura CORS sólo para `/api`.
7. Monta el router API.
8. Monta rutas SSR legacy.
9. Agrega fallback 404 y manejador de errores.
10. Escucha el puerto sólo cuando `app.js` es el proceso principal.

El orden importa. Si `express.json()` se registrara después de las rutas, `req.body` todavía no estaría interpretado. Si la sesión se registrara después de los controllers, `req.session` no existiría durante login, carrito o checkout.

Código central:

```js
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieSession({
    name: 'pediloo.session',
    keys: [process.env.SESSION_SECRET || 'web-1-cart-session'],
    httpOnly: true,
    sameSite,
    secure
}));
```

Fuente: `F:\Escritorio\Web-1\app.js:32-44`.

### 3.2 Router: método + URI -> función

El router es una tabla ejecutable. No contiene SQL ni reglas extensas.

```js
router.get('/products', productsApiController.getAll);
router.post('/products', productsApiController.create);
router.put('/products/:id', productsApiController.update);
router.delete('/products/:id', productsApiController.remove);
```

Fuente: `F:\Escritorio\Web-1\routes\api.router.js:16-20`.

### 3.3 Controller: frontera HTTP

El controller conoce `req` y `res`. Sus tareas son:

- leer `params`, `query`, `body` y `session`;
- validar forma y tipos del pedido;
- elegir el estado HTTP;
- llamar al service;
- convertir el resultado en JSON.

Ejemplo: el controller de productos verifica que `price` sea finito y no negativo, que `stock` sea entero no negativo y que la categoría exista.

Fuente: `F:\Escritorio\Web-1\controllers\api\productsApiController.js:4-57`.

### 3.4 Service: dominio y acceso a datos

El service no conoce `req` ni `res`. Recibe valores comunes de JavaScript y devuelve objetos, arrays o resultados de dominio.

Sus tareas son:

- ejecutar SQL;
- centralizar reglas reutilizables;
- transformar filas en respuestas seguras;
- coordinar transacciones;
- evitar duplicar lógica entre API y SSR.

Esta separación aplica DRY: los controllers API y los controllers EJS pueden reutilizar los mismos servicios sin copiar consultas.

Fuente académica: `F:\Escritorio\Web-1\docs\Ejercicio.md`.

### 3.5 SQLite: fuente persistente

En local, `db/database.js` abre una única conexión al archivo `db/database.db`, ejecuta el esquema, completa migraciones y carga datos iniciales cuando hacen falta.

```js
const db = new Database(dbPath);
db.exec(schema);
ensureSchema(db);
ensureSeedData(db);
```

Fuente: `F:\Escritorio\Web-1\db\database.js:7-20`.

### 3.6 Problemática de infraestructura: sincronización de productos y categorías

La ruta de base de datos cambia según el entorno:

```js
const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : process.env.VERCEL
        ? path.join('/tmp', 'pediloo-database.db')
        : path.join(__dirname, 'database.db');
```

Fuente: `F:\Escritorio\Web-1\db\database.js:7-12`.

**En local:** `POST /api/products` o `POST /api/categories` escribe en el mismo `database.db` que luego consulta `GET`. Por eso el recorrido POST → GET es consistente mientras vive el mismo proceso.

**En Vercel/serverless:** `/tmp` es un filesystem local y efímero de cada instancia. La instancia A puede responder `201` después del `INSERT`, pero la instancia B puede atender el `GET` con otro archivo, sin el registro creado por A. Un reinicio también puede ejecutar el bootstrap sobre una base nueva y volver al seed inicial.

Esto explica dos síntomas diferentes:

1. **Aparece tarde o parece no aparecer:** la interfaz carga productos y categorías en un `useEffect` al montar la pantalla; `apiFetch` tampoco fuerza `cache: 'no-store'`. La vista puede necesitar recarga o una nueva lectura.
2. **No funciona entre sesiones o instancias:** la cookie identifica una sesión del navegador, pero no convierte `/tmp` en una base compartida. El problema central es la persistencia distribuida, no la velocidad del `INSERT`.

**Prueba defendible:** crear una categoría o producto, guardar el `201` y su ID, pedir de nuevo la colección y repetir desde otra sesión o después de un reinicio/cold start. Si las respuestas difieren, la evidencia es que no existe una única fuente de verdad compartida. La prueba puede variar según la instancia que atienda cada request, por lo que no conviene prometer que fallará en todos los intentos.

**Corrección por capas:**

- `Cache-Control: no-store` para GET dinámicos y refetch/invalidate después de altas, modificaciones y borrados.
- SQLite sólo con un servidor y disco durable, si el alcance sigue siendo monoinstancia.
- Para serverless, migrar productos, categorías, usuarios y pedidos a una base persistente compartida como Turso/libSQL o Postgres (Neon, Supabase o Vercel Postgres).
- No copiar `database.db` al repositorio esperando que sea compartido: el filesystem del despliegue no cumple esa función.

## 4. Contrato completo de endpoints

| Método | Endpoint | Responsabilidad | Respuestas relevantes |
| --- | --- | --- | --- |
| `GET` | `/api/` | Salud básica del servicio | `200` |
| `GET` | `/api/products` | Lista, busca con `q` u ordena con `sort` | `200` |
| `GET` | `/api/products/:id` | Producto por ID | `200`, `400`, `404` |
| `POST` | `/api/products` | Crea producto | `201`, `400` |
| `PUT` | `/api/products/:id` | Actualiza producto completo | `200`, `400`, `404` |
| `DELETE` | `/api/products/:id` | Elimina producto | `200`, `400`, `404` |
| `GET` | `/api/categories` | Lista categorías | `200` |
| `GET` | `/api/categories/:id` | Categoría por ID | `200`, `400`, `404` |
| `POST` | `/api/categories` | Crea categoría | `201`, `400`, `409` |
| `PUT` | `/api/categories/:id` | Renombra o modifica | `200`, `400`, `404`, `409` |
| `DELETE` | `/api/categories/:id` | Elimina si no está usada | `200`, `404`, `409` |
| `GET` | `/api/cart` | Reconstruye el carrito | `200` |
| `POST` | `/api/cart/items` | Agrega una unidad | `201`, `409` |
| `PUT` | `/api/cart/items/:productId` | Aplica un `delta` entero | `200`, `400`, `409` |
| `DELETE` | `/api/cart/items/:productId` | Quita una línea | `200` |
| `DELETE` | `/api/cart` | Vacía el carrito | `200` |
| `GET` | `/api/orders` | Lista pedidos | `200` |
| `POST` | `/api/orders` | Confirma la compra | `201`, `400`, `404`, `409` |
| `PUT` | `/api/orders/:id` | Cambia estado del pedido | `200`, `400`, `404` |
| `GET` | `/api/users` | Lista usuarios públicos | `200` |
| `GET` | `/api/users/:id` | Usuario público por ID | `200`, `404` |
| `POST` | `/api/users` | Crea usuario | `201`, `400`, `409` |
| `PUT` | `/api/users/:id` | Modifica usuario | `200`, `400`, `404`, `409` |
| `DELETE` | `/api/users/:id` | Elimina, salvo último admin | `200`, `404`, `409` |
| `GET` | `/api/auth/me` | Lee identidad de sesión | `200` |
| `POST` | `/api/auth/login` | Autentica y crea estado de sesión | `200`, `401` |
| `POST` | `/api/auth/register` | Registra usuario común y autentica | `201`, `400`, `409` |
| `DELETE` | `/api/auth/session` | Destruye la sesión | `204` |
| `GET` | `/api/stats` | Agrega métricas del dashboard | `200` |

Fuente: `F:\Escritorio\Web-1\routes\api.router.js:12-52`.

## 5. Modelo de datos

```text
users 1 ------ N orders 1 ------ N order_items N ------ 1 products

categories 1 ------ N products
             relación lógica por nombre, no por foreign key
```

### Tablas

| Tabla | Qué representa | Campos decisivos |
| --- | --- | --- |
| `categories` | Clasificación del catálogo | `id`, `name`, `icon`, `type` |
| `products` | Producto vendible | `price`, `category`, `stock`, `isTopSeller` |
| `users` | Identidad y rol | `email`, `password_hash`, `admin_flag` |
| `orders` | Cabecera económica de una compra | `user_id`, `status`, importes, descuento |
| `order_items` | Foto de cada línea comprada | `product_id`, `quantity`, `price` |

`order_items.price` guarda el precio unitario utilizado en la compra. Esto conserva el historial aunque el precio actual del producto cambie después.

Fuente: `F:\Escritorio\Web-1\db\schema.sql:1-51` y `F:\Escritorio\Web-1\services\ordersService.js:69-84`.

### Categoría desnormalizada

`products.category` guarda texto en lugar de `category_id`. La ventaja es simplicidad. El costo es que la integridad depende del código.

Para sostener esa decisión, el service:

- acepta sólo categorías existentes al crear o editar productos;
- renombra productos y categoría dentro de una transacción;
- bloquea la eliminación de una categoría en uso.

Fuentes:

- Validación: `F:\Escritorio\Web-1\controllers\api\productsApiController.js:40-56`.
- Renombrado transaccional: `F:\Escritorio\Web-1\services\catalogService.js:37-53`.
- Bloqueo de baja: `F:\Escritorio\Web-1\services\catalogService.js:56-65`.

## 6. Lógica de productos

### 6.1 Lectura y representación

El service lee filas y luego agrega datos derivados:

```js
function statusFromStock(stock) {
    if (stock === 0) return 'Sin Stock';
    if (stock <= 12) return 'Stock Bajo';
    return 'Activo';
}
```

`status` no está almacenado en la tabla. Se calcula a partir de `stock`. Así se evita una contradicción como `stock = 0` y `status = 'Activo'`.

La misma transformación:

- normaliza `stock` a número;
- transforma `isTopSeller` de entero SQLite a booleano;
- agrega una imagen de reemplazo si `src` está vacío.

Fuente: `F:\Escritorio\Web-1\services\productsService.js:3-20`.

### 6.2 Alta

Flujo:

1. El controller valida el body.
2. Normaliza espacios y valores opcionales.
3. Busca la categoría sin distinguir mayúsculas.
4. El service ejecuta un `INSERT` parametrizado.
5. `lastInsertRowid` permite releer y devolver el objeto final.
6. La API responde `201 Created`.

Los signos `?` del statement separan los valores de la estructura SQL. Es la defensa principal contra inyección SQL en esos valores.

Fuente: `F:\Escritorio\Web-1\controllers\api\productsApiController.js:88-95` y `F:\Escritorio\Web-1\services\productsService.js:26-40`.

### 6.3 Modificación

La API usa `PUT`, por lo que exige los campos principales y reemplaza el conjunto editable. No implementa `PATCH` parcial.

Antes de actualizar:

- distingue ID inválido (`400`) de recurso ausente (`404`);
- vuelve a validar el body;
- conserva valores opcionales como `isTopSeller` o `stock` cuando corresponde.

Fuente: `F:\Escritorio\Web-1\controllers\api\productsApiController.js:60-70,98-108`.

### 6.4 Búsqueda y orden

`GET /api/products?q=texto` busca por título con `LIKE`. `sort=asc` y `sort=desc` delegan el orden a SQLite.

Fuente: `F:\Escritorio\Web-1\controllers\api\productsApiController.js:73-80` y `F:\Escritorio\Web-1\services\productsService.js:150-167`.

## 7. Lógica de categorías

Las reglas más defendibles son:

1. El nombre es obligatorio.
2. `type` sólo puede ser `main` u `other`.
3. No se permiten nombres duplicados sin distinguir mayúsculas.
4. Renombrar es una operación atómica sobre dos conjuntos de filas.
5. No se permite borrar una categoría usada por productos.

```js
const update = db.transaction(() => {
    updateCategory.run(...);
    updateProductsWithOldCategory.run(...);
});
```

Si una instrucción falla, SQLite revierte ambas. Esto evita que la categoría cambie de nombre mientras los productos conservan el nombre anterior.

Fuente: `F:\Escritorio\Web-1\services\catalogService.js:37-53`.

## 8. Usuarios, contraseñas y sesión

### 8.1 Usuario privado y usuario público

La fila privada incluye `password_hash`. La respuesta pública se construye explícitamente y no lo incluye.

```js
function publicUser(row) {
    return row && {
        id: row.id,
        name: row.name,
        email: row.email,
        adminFlag: Boolean(row.admin_flag)
    };
}
```

Esta transformación reduce exposición accidental de datos sensibles.

Fuente: `F:\Escritorio\Web-1\services\usersService.js:4-13`.

### 8.2 Hash de contraseña

El sistema:

1. genera una sal aleatoria de 16 bytes;
2. deriva una clave con `scrypt`;
3. guarda `algoritmo:sal:hash`;
4. al autenticar, repite la derivación;
5. compara con `timingSafeEqual`.

No guarda la contraseña en texto plano.

Fuente: `F:\Escritorio\Web-1\services\usersService.js:30-40`.

### 8.3 Registro y login

Registro:

- obliga nombre, apellido, email válido y contraseña mínima de 8 caracteres;
- comprueba que ambas contraseñas coincidan;
- evita email duplicado;
- fuerza `adminFlag: false` en el endpoint público;
- crea el usuario y guarda su ID en la sesión.

Login:

- busca el usuario por email sin distinguir mayúsculas;
- verifica contraseña;
- devuelve `401` si las credenciales no coinciden;
- guarda `req.session.userId` si son válidas.

Fuentes:

- Validación: `F:\Escritorio\Web-1\services\usersService.js:42-64`.
- Registro: `F:\Escritorio\Web-1\controllers\api\authApiController.js:15-18`.
- Login: `F:\Escritorio\Web-1\controllers\api\authApiController.js:8-12`.

### 8.4 Regla del último administrador

El sistema impide degradar o eliminar al último usuario administrador. La regla se verifica en el service porque afecta integridad del dominio y debe cumplirse sin importar qué interfaz invoque la operación.

Fuente: `F:\Escritorio\Web-1\services\usersService.js:82-123`.

### 8.5 Autenticación no es autorización

Autenticar responde: "¿quién sos?". Autorizar responde: "¿podés hacer esta operación?".

Pediloo implementa autenticación, pero las rutas de productos, categorías, pedidos y usuarios no tienen middleware que exija sesión ni rol admin. Por eso conocer un endpoint alcanza para invocarlo.

Fuente: `F:\Escritorio\Web-1\routes\api.router.js:16-49`.

Frase de defensa:

> La identidad está resuelta con sesión y hash. La autorización por rol todavía es una deuda técnica visible.

## 9. Carrito de sesión

### 9.1 Qué guarda

La sesión guarda sólo:

```js
{ productId: '1', quantity: 2 }
```

No guarda título, precio, imagen ni subtotal.

### 9.2 Qué reconstruye

Cada vez que se pide el detalle del carrito, `buildCartItem` consulta el producto actual y reconstruye:

- título;
- descripción;
- categoría;
- imagen;
- precio unitario;
- subtotal por línea.

Después dos `reduce` calculan subtotal general y cantidad total.

Fuente: `F:\Escritorio\Web-1\services\cartService.js:11-50`.

### 9.3 Por qué está diseñado así

El cliente o la sesión no pueden inventar un precio. La fuente del precio es SQLite. Además, un producto eliminado se descarta al reconstruir el carrito.

### 9.4 Reglas de cantidad

- No se agrega un producto inexistente.
- No se agrega un producto sin stock.
- No se incrementa por encima del stock actual.
- Si una resta lleva la cantidad a cero o menos, se elimina la línea.
- `delta` debe ser un entero distinto de cero.

Fuente: `F:\Escritorio\Web-1\services\cartService.js:57-108` y `F:\Escritorio\Web-1\controllers\api\cartApiController.js:18-26`.

## 10. Crear un pedido: la lógica más importante

### 10.1 Precondiciones

Antes de escribir:

1. reconstruye el carrito con datos actuales;
2. rechaza carrito vacío con `400`;
3. valida que el usuario exista si hay `userId`;
4. normaliza el cupón a mayúsculas;
5. acepta sólo `DESCUENTO10`;
6. calcula subtotal, porcentaje, monto de descuento y total.

Fuente: `F:\Escritorio\Web-1\services\ordersService.js:40-53`.

### 10.2 Transacción

Dentro de una única transacción:

1. crea la cabecera en `orders`;
2. prepara el insert de líneas;
3. descuenta stock de forma condicionada;
4. inserta cada línea con su precio histórico;
5. devuelve el ID de la orden.

```sql
UPDATE products SET stock = stock - ?
WHERE id = ? AND stock >= ?
```

La condición `stock >= ?` hace que la validación y el descuento ocurran en la misma instrucción. Luego se comprueba `changes === 1`.

Si una línea no tiene stock suficiente, se lanza un error `409`. La transacción revierte cabecera, líneas y descuentos de stock anteriores. No queda una compra parcial.

Fuente: `F:\Escritorio\Web-1\services\ordersService.js:55-88`.

### 10.3 Vaciar después del commit

El carrito se vacía después de que `create()` termina correctamente. Si la transacción falla, no se ejecuta ese paso y el usuario conserva su carrito.

Fuente: `F:\Escritorio\Web-1\services\ordersService.js:88-90`.

### 10.4 Estados permitidos

Sólo se aceptan:

- `Recibido`
- `En proceso`
- `Listo para entregar`

Una lista cerrada evita estados con errores de escritura o valores que la interfaz no entiende.

Fuente: `F:\Escritorio\Web-1\services\ordersService.js:4,93-99`.

## 11. Estadísticas

`GET /api/stats` compone datos de varios servicios:

- total de productos;
- total de categorías;
- total de usuarios;
- total de pedidos;
- suma de ventas.

El controller coordina, pero no escribe SQL. Es un ejemplo simple de agregación de datos para otro cliente.

Fuente: `F:\Escritorio\Web-1\controllers\api\statsApiController.js:6-14`.

Límite actual: para usuarios y pedidos carga las colecciones completas y calcula en JavaScript. A mayor escala convendrían consultas `COUNT` y `SUM` en SQLite.

## 12. Errores y estados HTTP

### 12.1 Qué significa cada estado usado

| Estado | Significado en Pediloo | Ejemplo |
| --- | --- | --- |
| `200 OK` | Operación correcta | lectura o actualización |
| `201 Created` | Se creó un recurso | producto, categoría, usuario, pedido |
| `204 No Content` | Éxito sin body | logout |
| `400 Bad Request` | Forma o valor inválido | JSON roto, precio negativo, estado inválido |
| `401 Unauthorized` | Credenciales incorrectas | login fallido |
| `404 Not Found` | Recurso o ruta ausente | producto inexistente |
| `409 Conflict` | Regla de estado impide la operación | falta de stock, duplicado, categoría usada |
| `500 Internal Server Error` | Fallo no clasificado | error inesperado |

### 12.2 Manejador global

El middleware final distingue peticiones `/api` de páginas SSR. Para API responde JSON. Para JSON mal formado responde `400` con `{ error: 'JSON inválido' }`.

Fuente: `F:\Escritorio\Web-1\app.js:105-129`.

### 12.3 Ruta API desconocida

El fallback vive dentro del router API y responde JSON `404`, antes de llegar al fallback HTML general.

Fuente: `F:\Escritorio\Web-1\routes\api.router.js:51-53`.

## 13. CORS y cookies

CORS decide qué orígenes de navegador pueden leer la API. Por defecto se admiten:

- `http://localhost:5173`
- `https://pediloo-front.vercel.app`

La configuración usa `credentials: true`, necesaria para cookies entre frontend y API. En producción la cookie usa `sameSite: 'none'` y `secure: true`; en local usa `lax` y no exige HTTPS.

Fuente: `F:\Escritorio\Web-1\app.js:9-11,35-44,67-78`.

Punto conceptual:

> CORS no autentica ni autoriza usuarios. Sólo aplica una política del navegador sobre orígenes.

## 14. Inicialización, migración y seed

### 14.1 Arranque idempotente

`CREATE TABLE IF NOT EXISTS` permite ejecutar el esquema varias veces. `addColumn` consulta `PRAGMA table_info` y agrega columnas faltantes.

Fuente: `F:\Escritorio\Web-1\db\schema.sql:1-51` y `F:\Escritorio\Web-1\db\bootstrap.js:4-13`.

### 14.2 Seed

Las categorías y productos se insertan cuando sus tablas están vacías. Además, `user_version` controla una migración de catálogo que inserta datos faltantes sin duplicar por nombre o título.

Fuente: `F:\Escritorio\Web-1\db\bootstrap.js:69-147`.

### 14.3 Usuario administrador de demostración

Si no existe, el bootstrap crea `admin@pediloo.local` con contraseña inicial conocida en el código. Es útil para una demo académica, pero no es apropiado para producción.

Fuente: `F:\Escritorio\Web-1\db\bootstrap.js:108-114`.

## 15. Paradigmas y estilo de programación

La API no usa programación orientada a objetos clásica. No hay clases, herencia ni instancias de dominio. Predomina un estilo modular con funciones y objetos planos.

### Funcional y declarativo

- `map` transforma filas de productos y pedidos.
- `filter` descarta líneas inválidas del carrito.
- `reduce` calcula totales y métricas.
- funciones como `statusFromStock` convierten una entrada en una salida predecible.

### Imperativo

- los bucles de seed insertan registros;
- la transacción de pedido ejecuta instrucciones en orden;
- se modifica `session.cart` porque la sesión es estado mutable.

La respuesta correcta no es "todo es funcional". Es:

> Predomina la composición de funciones y objetos planos, con lógica imperativa donde hay efectos de persistencia o mutación de sesión.

Fuentes: `F:\Escritorio\Web-1\services\cartService.js:35-50`, `F:\Escritorio\Web-1\services\ordersService.js:55-90` y `F:\Escritorio\Web-1\db\bootstrap.js:69-147`.

## 16. Qué verifica la prueba integrada

`npm test`:

1. crea una carpeta y una SQLite temporales;
2. configura `DATABASE_PATH` antes de importar la app;
3. inicia Express en un puerto libre;
4. conserva la cookie entre peticiones;
5. prueba preflight CORS;
6. verifica catálogo, búsqueda y orden;
7. crea y renombra una categoría;
8. crea, modifica y elimina un producto;
9. crea y elimina un usuario;
10. inicia sesión y consulta `/auth/me`;
11. agrega e incrementa carrito;
12. crea un pedido con descuento;
13. cambia su estado;
14. confirma que el carrito se vació;
15. verifica estadísticas y fallbacks;
16. cierra el servidor y borra la base temporal.

Es una prueba integrada porque usa HTTP, Express, sesiones, services y una base SQLite real. No reemplaza esas capas con mocks.

Fuente: `F:\Escritorio\Web-1\test\api.test.js:7-188`.

Resultado verificado:

```text
tests 1
pass 1
fail 0
```

## 17. Limitaciones que conviene decir con honestidad

1. No hay middleware de autorización para proteger CRUD, usuarios, pedidos o estadísticas.
2. El secreto de sesión está escrito en el repositorio.
3. `cookie-session` firma pero no cifra el contenido de la sesión; el secreto tiene un fallback escrito en el código y la cookie tiene límite de tamaño.
4. En Vercel la base se ubica en `/tmp`, que es almacenamiento efímero y no compartido entre instancias.
5. `POST /orders` acepta `userId` del body si no hay sesión. Esa asociación debería depender de una política segura del servidor.
6. Las categorías se relacionan por nombre y no por foreign key.
7. No hay paginación en productos, usuarios ni pedidos.
8. Estadísticas carga pedidos y usuarios completos para contar o sumar.
9. El borrado de un producto ya referenciado por `order_items` puede provocar una restricción SQLite que hoy no se traduce a un `409` específico.
10. El bootstrap contiene credenciales administrativas de demostración.

Estas limitaciones no anulan el aprendizaje. Marcan la diferencia entre una entrega académica funcional y un backend listo para producción.

## 18. Cinco recorridos para explicar en el pizarrón

### Recorrido A: crear producto

```text
POST /api/products
-> router
-> controller valida tipos y categoría
-> service ejecuta INSERT parametrizado
-> SQLite asigna ID
-> service relee y deriva status
-> controller responde 201
```

### Recorrido B: renombrar categoría

```text
PUT /api/categories/:id
-> valida ID, body y duplicados
-> transacción
   -> UPDATE categories
   -> UPDATE products con el nombre anterior
-> commit
-> 200 + categoría actualizada
```

### Recorrido C: login

```text
POST /api/auth/login
-> busca fila privada por email
-> deriva hash con la sal guardada
-> comparación segura
-> guarda userId en sesión
-> devuelve usuario público
```

### Recorrido D: obtener carrito

```text
GET /api/cart + cookie
-> lee productId y quantity de la sesión
-> relee producto y precio en SQLite
-> calcula subtotales con reduce
-> devuelve detalle JSON
```

### Recorrido E: confirmar compra

```text
POST /api/orders
-> reconstruye carrito
-> valida usuario y cupón
-> calcula importes
-> transacción: orden + stock + líneas
-> commit
-> vacía carrito
-> 201 + pedido
```

## 19. Preguntas probables de defensa

### ¿Por qué separar controller y service?

Porque HTTP y negocio cambian por razones diferentes. El controller decide estados y JSON. El service concentra SQL y reglas reutilizables. Así se evita duplicación y se puede usar el mismo dominio desde API y SSR.

### ¿Por qué validar también en backend?

Porque el frontend no es una frontera de confianza. Cualquier cliente puede enviar una petición manual. La validación de interfaz mejora experiencia; la del backend protege integridad.

### ¿Por qué usar statements parametrizados?

Porque separan los valores de la estructura SQL, evitan problemas de escape y reducen el riesgo de inyección SQL.

### ¿Por qué el status del producto no es una columna?

Porque es una consecuencia del stock. Derivarlo mantiene una sola fuente de verdad.

### ¿Por qué el carrito no guarda precios?

Porque el precio es un dato sensible del negocio. Se relee de SQLite antes de mostrar el carrito y antes de comprar.

### ¿Cuándo baja el stock?

Al confirmar el pedido. Agregar al carrito sólo reserva intención en la sesión, no inventario.

### ¿Por qué la compra usa una transacción?

Porque orden, líneas y stock forman una sola unidad lógica. O se confirman todas o se revierten todas.

### ¿Qué logra la condición `stock >= quantity`?

Combina comprobación y descuento en una operación atómica de SQLite. Si no alcanza, `changes` es cero y la compra se revierte.

### ¿La API es stateless?

No completamente. Los recursos usan convenciones REST, pero usuario y carrito dependen de una sesión servidor identificada por cookie.

### ¿La contraseña viaja de vuelta al cliente?

No. `publicUser` construye un DTO sin `password_hash`.

### ¿Hay autorización de administrador?

No. Hay identidad y rol almacenado, pero faltan guards que apliquen ese rol a las rutas.

### ¿CORS protege los endpoints?

No reemplaza autorización. CORS sólo controla qué orígenes puede usar un navegador para leer respuestas.

### ¿Por qué SQLite?

Porque el proyecto es pequeño, local y académico. Permite SQL real y transacciones con poca infraestructura. Para despliegue distribuido conviene una base persistente externa.

### ¿Por qué una categoría o producto puede aparecer tarde o desaparecer entre sesiones?

Porque el frontend carga las colecciones al montar y no fuerza `no-store`, pero la causa de consistencia más grave está en el backend desplegado: con `VERCEL=1`, `database.js` usa `/tmp`. Cada instancia serverless puede tener un archivo SQLite distinto y efímero. Un `POST` puede confirmar en la instancia A y el `GET` siguiente puede leer la instancia B.

La respuesta correcta no es “SQLite es lento”, sino:

> Hay que separar actualización de UI, caché HTTP y persistencia. `no-store` y un refetch ayudan a la vista; sólo una base compartida y durable resuelve la consistencia entre instancias.

### ¿Cambiar de sesión debería cambiar los productos y categorías?

No. La sesión separa identidad y carrito; el catálogo debería salir de una fuente de datos común. Si otra sesión ve otro catálogo en producción, el problema es la base por instancia o un estado inicial distinto, no el hecho de usar otra cookie.

## 20. Respuestas de 20 segundos

### Arquitectura

> La request entra por Express, el router selecciona un controller, el controller valida la frontera HTTP y delega en un service. El service ejecuta la regla y SQL parametrizado. La respuesta vuelve como JSON con un estado HTTP explícito.

### Carrito

> La sesión guarda sólo identificador y cantidad. El detalle relee precio y producto desde SQLite, calcula subtotales y limita cantidades por stock. Así la sesión no se convierte en fuente de verdad económica.

### Compra

> La compra valida el carrito, calcula el descuento y abre una transacción. Crea la orden, descuenta stock con una condición atómica e inserta las líneas. Si algo falla, SQLite hace rollback y el carrito no se vacía.

### Seguridad

> Las contraseñas usan sal, scrypt y comparación segura, y la sesión usa cookie `httpOnly`. Sin embargo, falta autorización por rol y la configuración de sesión sigue siendo de demostración.

### Infraestructura

> En local el POST y el GET usan el mismo archivo SQLite. En Vercel `database.js` apunta a `/tmp`, que es local y efímero por instancia: una instancia puede confirmar el alta y otra no verla. `no-store` y un refetch corrigen la frescura de la UI, pero la solución de consistencia es una base externa compartida.

## 21. Plan de estudio recomendado

### Primera vuelta: mapa

Memorizar solamente:

```text
app -> router -> controller -> service -> SQLite/sesión
```

Luego ubicar cada carpeta sin leer detalles.

### Segunda vuelta: tres reglas

Dominar estas tres:

1. `status` se deriva de `stock`.
2. El carrito guarda IDs y cantidades, no precios.
3. La compra usa transacción y descuento de stock condicionado.

### Tercera vuelta: límites

Poder explicar sin ayuda:

1. autenticación frente a autorización;
2. REST de estilo recurso frente a sesión con estado;
3. SQLite local frente a persistencia distribuida;
4. categoría textual frente a foreign key;
5. prueba integrada frente a prueba unitaria.

## 22. Checklist antes de exponer

- [ ] Puedo dibujar las cinco capas sin mirar.
- [ ] Puedo explicar por qué el orden de middlewares importa.
- [ ] Puedo relacionar GET, POST, PUT y DELETE con un endpoint real.
- [ ] Puedo diferenciar `400`, `401`, `404` y `409`.
- [ ] Puedo explicar un statement parametrizado.
- [ ] Puedo explicar `statusFromStock` como dato derivado.
- [ ] Puedo explicar qué vive en sesión y qué vive en SQLite.
- [ ] Puedo narrar la transacción de compra en orden.
- [ ] Puedo diferenciar autenticación y autorización.
- [ ] Puedo mencionar al menos tres límites actuales.
- [ ] Puedo ejecutar `npm test` y explicar qué integra.

## 23. Comando de verificación

```powershell
cd F:\Escritorio\Web-1
npm test
```

La guía se considera alineada con el código mientras esta prueba pase y las referencias de líneas sigan coincidiendo.
