import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BracketsCurly,
  Browser,
  Check,
  Database,
  FileText,
  Gear,
  GitBranch,
  Key,
  Lightning,
  List,
  LockKey,
  MagnifyingGlass,
  Palette,
  Play,
  ShieldCheck,
  ShoppingBagOpen,
  SquaresFour,
  Stack,
  TerminalWindow,
  UsersThree,
  Warning,
  Wrench,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react'
import './App.css'

type SlideKind =
  | 'cover'
  | 'architecture'
  | 'boot'
  | 'request'
  | 'rest'
  | 'model'
  | 'products'
  | 'domain'
  | 'auth'
  | 'cart'
  | 'react'
  | 'css'
  | 'theory'
  | 'decisions'
  | 'findings'
  | 'defense'
  | 'close'

type Slide = {
  id: string
  index: string
  label: string
  eyebrow: string
  title: string
  description: string
  kind: SlideKind
}

const slides: Slide[] = [
  {
    id: 'inicio',
    index: '01',
    label: 'Inicio',
    eyebrow: 'PEDILOO · DEFENSA DE PROYECTO',
    title: 'Una tienda que se entiende porque cada capa tiene un trabajo.',
    description: 'La interfaz representa, la API valida y SQLite conserva la verdad.',
    kind: 'cover',
  },
  {
    id: 'arquitectura',
    index: '02',
    label: 'Sistema',
    eyebrow: 'QUÉ SISTEMA ESTAMOS ESTUDIANDO',
    title: 'Dos aplicaciones conectadas, una fuente de verdad.',
    description: 'React y Express no son dos copias del negocio: consultan el mismo dato persistido.',
    kind: 'architecture',
  },
  {
    id: 'arranque',
    index: '03',
    label: 'Arranque',
    eyebrow: 'CÓMO SE PONE EN MARCHA',
    title: 'El frontend monta el árbol. El backend prepara el mundo.',
    description: 'Providers, sesión, parsers, rutas y esquema quedan listos antes de resolver una operación.',
    kind: 'boot',
  },
  {
    id: 'peticion',
    index: '04',
    label: 'Petición',
    eyebrow: 'DEL EVENTO AL JSON',
    title: 'Una petición atraviesa fronteras claras.',
    description: 'El cliente centraliza transporte; Express separa HTTP, dominio y persistencia.',
    kind: 'request',
  },
  {
    id: 'rest',
    index: '05',
    label: 'REST',
    eyebrow: 'CONTRATO VIGENTE',
    title: 'La ruta expresa el recurso. El verbo expresa la intención.',
    description: 'GET lee, POST crea o ejecuta, PUT actualiza y DELETE elimina.',
    kind: 'rest',
  },
  {
    id: 'modelo',
    index: '06',
    label: 'Modelo',
    eyebrow: 'DATOS Y OBJETOS',
    title: 'SQLite guarda filas. TypeScript describe contratos.',
    description: 'Hay objetos y DTOs, pero no clases ni orientación a objetos clásica.',
    kind: 'model',
  },
  {
    id: 'productos',
    index: '07',
    label: 'ABM productos',
    eyebrow: 'LECTURA · ALTA · MODIFICACIÓN · BAJA',
    title: 'El CRUD se puede seguir desde la pantalla hasta el INSERT.',
    description: 'Cada acción administrativa tiene evidencia en React, API, service y base.',
    kind: 'products',
  },
  {
    id: 'dominio',
    index: '08',
    label: 'Dominio',
    eyebrow: 'CONSISTENCIA EN EL NEGOCIO',
    title: 'Las reglas importantes no viven en un botón.',
    description: 'Categorías, status derivado, PUT, DELETE y transacciones pertenecen al dominio.',
    kind: 'domain',
  },
  {
    id: 'auth',
    index: '09',
    label: 'Usuarios',
    eyebrow: 'IDENTIDAD Y AUTENTICACIÓN',
    title: 'La sesión identifica; el service protege el dato.',
    description: 'La respuesta pública omite el hash y la contraseña se verifica con herramientas del runtime.',
    kind: 'auth',
  },
  {
    id: 'carrito',
    index: '10',
    label: 'Compra',
    eyebrow: 'CARRITO · STOCK · PEDIDO',
    title: 'El carrito recuerda lo mínimo y recalcula lo sensible.',
    description: 'Precio y stock se leen de SQLite; checkout confirma orden, líneas y descuento en una operación.',
    kind: 'cart',
  },
  {
    id: 'react',
    index: '11',
    label: 'React',
    eyebrow: 'T1 · T2 · T3',
    title: 'Componentes, props y estado convierten eventos en UI.',
    description: 'La pantalla no se edita a mano: cambia el estado y React reconcilia la descripción declarativa.',
    kind: 'react',
  },
  {
    id: 'css',
    index: '12',
    label: 'CSS y hooks',
    eyebrow: 'T4 · T5 · T7',
    title: 'El layout es CSS. La sincronización es un efecto.',
    description: 'Responsive, Context, cleanup y routing se usan por necesidad concreta, no por catálogo.',
    kind: 'css',
  },
  {
    id: 'teoria',
    index: '13',
    label: 'Mapa teórico',
    eyebrow: 'TEORÍA → CÓDIGO → DEFENSA',
    title: 'Cada concepto tiene una evidencia defendible.',
    description: 'La teoría ofrece herramientas; la arquitectura selecciona las que resuelven el problema.',
    kind: 'theory',
  },
  {
    id: 'decisiones',
    index: '14',
    label: 'Decisiones',
    eyebrow: 'ALTERNATIVAS Y LÍMITES',
    title: 'Elegir menos herramientas también es una decisión técnica.',
    description: 'Fetch, Context, CSS nativo y SQLite alcanzan para esta escala, con techos conocidos.',
    kind: 'decisions',
  },
  {
    id: 'hallazgos',
    index: '15',
    label: 'Honestidad',
    eyebrow: 'LO QUE HAY QUE DECIR',
    title: 'Una demo funcional todavía tiene riesgos visibles.',
    description: 'La defensa mejora cuando distingue arquitectura académica, deuda técnica y seguridad real.',
    kind: 'findings',
  },
  {
    id: 'defensa',
    index: '16',
    label: 'Defensa',
    eyebrow: 'DEMO MÍNIMA Y RESPUESTA CORTA',
    title: 'Mostrar el flujo completo en nueve movimientos.',
    description: 'Crear, comprar, agotar stock, cambiar estado y verificar la convergencia en SQLite.',
    kind: 'defense',
  },
  {
    id: 'verificacion',
    index: '17',
    label: 'Verificación',
    eyebrow: 'REPRODUCIBLE',
    title: 'Una explicación sólida termina en comandos ejecutables.',
    description: 'El backend se prueba integrado; el frontend se comprueba con typecheck, lint y build.',
    kind: 'close',
  },
  {
    id: 'cierre',
    index: '18',
    label: 'Cierre',
    eyebrow: 'MAPA FINAL PARA MEMORIZAR',
    title: 'React representa y solicita. Express valida y coordina.',
    description: 'Los services aplican dominio y SQLite confirma la verdad persistida.',
    kind: 'close',
  },
]

const apiFetchCode = [
  'export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {',
  '  const headers = new Headers(options.headers);',
  "  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json');",
  '  const response = await fetch(`${API_BASE_URL}${endpoint}`, {',
  '    ...options, headers, credentials: \'include\',',
  '  });',
  '  const text = await response.text();',
  '  const data = text ? JSON.parse(text) : null;',
  "  if (!response.ok) throw new Error('mensaje de la API');",
  '  return resolveAssetUrl(data) as T;',
  '}',
].join('\n')

const productEffectCode = [
  'useEffect(() => {',
  '  async function fetchProducts() {',
  "    const data = await apiFetch<Product[]>('/products');",
  '    setProducts(data.map(normalizeProduct));',
  '  }',
  '  fetchProducts();',
  '}, []);',
].join('\n')

const productSaveCode = [
  'const productPayload = {',
  '  title, price: Math.max(0, Number(price) || 0),',
  '  stock: Math.max(0, Math.floor(Number(stock)) || 0),',
  '  src, description, category: category.trim(),',
  '};',
  "await apiFetch('/products', { method: 'POST', body: JSON.stringify(productPayload) });",
].join('\n')

const checkoutCode = [
  'const confirmOrder = db.transaction(() => {',
  '  const order = createOrder(userId, discount);',
  '  for (const line of cart) {',
  '    reserveStock(line.productId, line.quantity);',
  '    createOrderItem(order.id, line);',
  '  }',
  '  return order;',
  '});',
  'confirmOrder(); // commit o rollback',
].join('\n')

const controlledFormCode = [
  'const [title, setTitle] = useState(\'\');',
  '',
  '<input',
  '  value={title}',
  '  onChange={(event) => setTitle(event.target.value)}',
  '/>',
].join('\n')

const statusCode = [
  'function statusFromStock(stock) {',
  "  if (stock === 0) return 'Sin Stock';",
  "  if (stock <= 12) return 'Stock Bajo';",
  "  return 'Activo';",
  '}',
].join('\n')

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      className={compact ? 'brand-logo brand-logo-compact' : 'brand-logo'}
      src="/brand/logoheader.png"
      alt="Pediloo"
    />
  )
}

function SlideHeader({ slide }: { slide: Slide }) {
  return (
    <div className="slide-heading">
      <p className="eyebrow">{slide.eyebrow}</p>
      <h1>{slide.title}</h1>
      <p className="slide-description">{slide.description}</p>
    </div>
  )
}

function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="source-line"><FileText size={14} /> {children}</p>
}

function CodePanel({ file, code, caption }: { file: string; code: string; caption?: string }) {
  return (
    <div className="code-panel">
      <div className="code-panel-head"><span>{file}</span><span>CODE</span></div>
      <pre><code>{code}</code></pre>
      {caption && <div className="code-caption"><Check size={14} weight="bold" /> {caption}</div>}
    </div>
  )
}

function Tag({ children, tone = 'mint' }: { children: React.ReactNode; tone?: 'mint' | 'yellow' | 'coral' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>
}

function Metric({ value, label, tone = 'mint' }: { value: string; label: string; tone?: 'mint' | 'yellow' | 'coral' }) {
  return <div className={`metric metric-${tone}`}><strong>{value}</strong><span>{label}</span></div>
}

function CoverSlide() {
  return (
    <div className="cover-layout">
      <div className="cover-copy">
        <div className="cover-kicker"><span className="live-marker" /> Proyecto integrador · Web 1</div>
        <SlideHeader slide={slides[0]} />
        <div className="tag-row"><Tag>React 19 + TypeScript</Tag><Tag>Express 5 + REST</Tag><Tag>SQLite + sesión</Tag></div>
        <div className="cover-actions">
          <span className="action-hint"><Play size={14} weight="fill" /> Navegación interactiva</span>
          <span className="keycap">→</span><span className="action-hint">avanzar</span>
        </div>
      </div>
      <div className="cover-visual" aria-label="Flujo completo de Pediloo">
        <BrandLogo />
        <div className="architecture-orbit orbit-one" />
        <div className="architecture-orbit orbit-two" />
        <div className="system-card">
          <div className="system-card-top"><span className="window-controls"><i /><i /><i /></span><span className="mono-label">pediloo / flow</span><ArrowUpRight size={17} /></div>
          <div className="system-card-body">
            <div className="system-title-line"><span className="system-dot" /> pedido confirmado</div>
            <strong>Una experiencia que<br />mantiene el contexto.</strong>
            <div className="system-stats"><Metric value="React" label="representa" /><Metric value="REST" label="coordina" tone="yellow" /><Metric value="SQL" label="persiste" tone="coral" /></div>
          </div>
        </div>
        <div className="floating-tag tag-top"><BracketsCurly size={15} /> teoría + código</div>
        <div className="floating-tag tag-bottom"><Database size={15} /> fuente de verdad</div>
      </div>
    </div>
  )
}

function ArchitectureSlide() {
  const layers = [
    ['01', ShoppingBagOpen, 'Frontend', 'reactfinal', 'SPA, páginas, componentes, estado, rutas y feedback.'],
    ['02', TerminalWindow, 'Backend', 'Web-1', 'Express recibe HTTP, mantiene sesión y delega reglas.'],
    ['03', Database, 'Persistencia', 'SQLite', 'Productos, usuarios, pedidos, líneas y categorías.'],
  ] as const
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[1]} />
      <div className="layer-grid">
        {layers.map(([number, Icon, name, tech, detail]) => (
          <motion.article className="layer-card" key={name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="layer-index">{number}</div><div className="layer-icon"><Icon size={24} weight="duotone" /></div>
            <p className="card-label">{name}</p><h2>{tech}</h2><p>{detail}</p>
          </motion.article>
        ))}
      </div>
      <div className="source-strip">
        <span><Browser size={16} /> React no abre `database.db`</span><ArrowRight size={16} /><span><TerminalWindow size={16} /> HTTP + cookie</span><ArrowRight size={16} /><span><Database size={16} /> SQLite conserva</span>
      </div>
      <SourceLine>Respaldo: `reactfinal/src/utils/api.ts:33-59` → `Web-1/app.js:66-72` → `Web-1/routes/api.router.js:16-51` → services → `db/database.js:12-20`.</SourceLine>
    </div>
  )
}

function BootSlide() {
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[2]} />
      <div className="split-grid boot-grid">
        <div className="evidence-column">
          <div className="section-label"><SquaresFour size={17} /> Frontend</div>
          <CodePanel file="reactfinal/src/main.tsx:7-11" code={'createRoot(document.getElementById(\'root\')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)'} caption="createRoot monta el árbol React; StrictMode ayuda a detectar efectos incorrectos." />
          <div className="provider-stack"><span>DialogProvider</span><span>SnackbarProvider</span><span>StoreProvider</span><span>BrowserRouter</span></div>
        </div>
        <div className="evidence-column">
          <div className="section-label"><Database size={17} /> Backend</div>
          <CodePanel file="Web-1/db/database.js:12-20" code={'const db = new Database(dbPath);\ndb.exec(fs.readFileSync(schemaPath, \'utf8\'));\nensureSchema(db);\nensureSeedData(db);'} caption="La conexión carga esquema y datos iniciales antes de atender la API." />
          <p className="defense-note"><Wrench size={18} /> `better-sqlite3` y SQL directo encajan en una aplicación académica pequeña. Un ORM o una base distribuida tendrían sentido con otra escala.</p>
        </div>
      </div>
      <SourceLine>Providers respaldados por `reactfinal/src/App.tsx:1915-1929`; montaje de API por `Web-1/app.js:66-72`.</SourceLine>
    </div>
  )
}

function RequestSlide() {
  const steps = [
    ['01', 'Evento o efecto', 'submit, click o carga inicial'],
    ['02', 'apiFetch', 'URL, JSON, cookie, error y assets'],
    ['03', 'Router + controller', 'ruta HTTP, body, parámetros y status'],
    ['04', 'Service + SQLite', 'regla de dominio y SQL parametrizado'],
    ['05', 'JSON + setState', 'feedback y nuevo render'],
  ]
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[3]} />
      <div className="split-grid request-grid">
        <div className="flow-list">
          {steps.map(([number, title, detail], index) => <div className="flow-row" key={number}><span className="flow-number">{number}</span><div><h2>{title}</h2><p>{detail}</p></div>{index < steps.length - 1 && <ArrowRight className="flow-row-arrow" size={16} />}</div>)}
        </div>
        <div><CodePanel file="reactfinal/src/utils/api.ts:33-59" code={apiFetchCode} caption="`fetch` es nativo; el adaptador concentra decisiones repetidas." /><SourceLine>El texto se parsea sólo si existe: un `204 No Content` no rompe con `JSON.parse('')`.</SourceLine></div>
      </div>
    </div>
  )
}

function RestSlide() {
  const rows = [
    ['GET', '/products', 'listar y obtener'], ['POST', '/products', 'crear producto'], ['PUT', '/products/:id', 'reemplazar campos'], ['DELETE', '/products/:id', 'borrar producto'],
    ['GET/POST', '/categories', 'leer y crear'], ['GET/PUT/DELETE', '/categories/:id', 'detalle, editar, borrar'], ['GET/POST', '/orders', 'listar y crear pedido'], ['PUT', '/orders/:id', 'cambiar estado'],
    ['GET/POST', '/users', 'listar y crear'], ['GET', '/auth/me', 'sesión o null'], ['POST', '/auth/login', 'autenticar'], ['DELETE', '/auth/session', 'destruir sesión'],
  ]
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[4]} />
      <div className="contract-table"><div className="table-head"><span>Método</span><span>Endpoint</span><span>Efecto</span></div>{rows.map(([method, endpoint, effect]) => <div className="table-row" key={`${method}-${endpoint}`}><strong>{method}</strong><code>{endpoint}</code><span>{effect}</span></div>)}</div>
      <div className="split-note"><p><Key size={17} /> No existe `POST /api/upload`: el frontend usa `FileReader` y guarda un Data URL en `src`. Funciona para demo, no es upload backend.</p><p><ShieldCheck size={17} /> REST no significa que todo sea stateless: auth y carrito usan sesión stateful con cookie.</p></div>
      <SourceLine>Rutas comprobables en `Web-1/routes/api.router.js:16-51`; controller y service no mezclan SQL con UI.</SourceLine>
    </div>
  )
}

function ModelSlide() {
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[5]} />
      <div className="split-grid model-grid">
        <div className="schema-map">
          <div className="schema-node node-user"><UsersThree size={17} /> USERS <small>id · email · admin_flag</small></div>
          <div className="schema-node node-order"><Stack size={17} /> ORDERS <small>user_id · status · total</small></div>
          <div className="schema-node node-items"><List size={17} /> ORDER_ITEMS <small>order_id · product_id · quantity</small></div>
          <div className="schema-node node-product"><ShoppingBagOpen size={17} /> PRODUCTS <small>title · price · category · stock</small></div>
          <div className="schema-node node-category"><SquaresFour size={17} /> CATEGORIES <small>name · type</small></div>
        </div>
        <div><CodePanel file="reactfinal/src/utils/store.ts:4-14" code={'export interface Product {\n  id: number;\n  title: string;\n  price: number;\n  category: string;\n  stock: number;\n  status: ProductStatus;\n}'} caption="La interface desaparece al compilar; los datos viajan como objetos JSON." /><div className="definition-list"><div><strong>Modelo relacional</strong><span>filas, claves y constraints</span></div><div><strong>DTO TypeScript</strong><span>contrato estructural de compilación</span></div><div><strong>Objetos planos</strong><span>payloads y actualizaciones inmutables</span></div></div></div>
      </div>
      <div className="warning-band"><Warning size={18} /> `products.category` guarda el nombre, no `category_id`. Es simple, pero renombrar exige actualizar productos y no ofrece integridad referencial real.</div>
      <SourceLine>Diagrama respaldado por `Web-1/db/schema.sql:1-51`; relaciones principales en `orders.user_id` y `order_items`.</SourceLine>
    </div>
  )
}

function ProductsSlide() {
  const steps = [['GET', 'Listar', 'useEffect carga y guarda el array'], ['POST', 'Alta', 'formulario controlado + validación'], ['PUT', 'Editar', 'mismo formulario, endpoint dinámico'], ['DELETE', 'Baja', 'confirmación + borrado físico']]
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[6]} />
      <div className="abm-strip">{steps.map(([verb, title, detail]) => <div className="abm-item" key={verb}><Tag tone={verb === 'DELETE' ? 'coral' : verb === 'PUT' ? 'yellow' : 'mint'}>{verb}</Tag><h2>{title}</h2><p>{detail}</p></div>)}</div>
      <div className="split-grid products-grid"><CodePanel file="ProductsList.tsx:102-127" code={productEffectCode} caption="La petición inicial es un efecto externo; no se hace fetch durante render." /><CodePanel file="ProductView.tsx:173-190" code={productSaveCode} caption="Frontend mejora UX; el controller vuelve a validar la frontera de confianza." /></div>
      <div className="defense-note"><MagnifyingGlass size={18} /><span><strong>Filtro local:</strong> `filter` crea un array nuevo y evita una petición por tecla. Con miles de productos convendrían búsqueda y paginación backend.</span></div>
      <SourceLine>Alta: `ProductView.tsx:159-192` → `productsApiController.js:88-108` → `productsService.js:26-40` → `schema.sql:8-17`.</SourceLine>
    </div>
  )
}

function DomainSlide() {
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[7]} />
      <div className="split-grid domain-grid">
        <div className="evidence-column"><div className="section-label"><GitBranch size={17} /> Status derivado</div><CodePanel file="Web-1/services/productsService.js:5-20" code={statusCode} caption="No se duplica una consecuencia de stock en otra columna." /><div className="mini-list"><span><Check size={15} /> Stock 0 → Sin Stock</span><span><Check size={15} /> Stock 1 a 12 → Stock Bajo</span><span><Check size={15} /> Stock mayor a 12 → Activo</span></div></div>
        <div className="evidence-column"><div className="section-label"><LockKey size={17} /> Categoría consistente</div><CodePanel file="catalogService.js:37-53" code={'const update = db.transaction(() => {\n  updateCategory.run(name, icon, type, id);\n  updateProducts.run(name, current.name);\n});\nupdate();'} caption="Renombrar categoría y productos ocurre junto o no ocurre." /><p className="defense-note"><Warning size={18} /> La asignación masiva posterior usa varios PUT y `Promise.all`: es una zona N+1 y no es transaccional completa.</p></div>
      </div>
      <div className="split-note"><p><strong>PUT:</strong> payload completo, simple y explícito. PATCH tendría sentido con ediciones parciales o clientes versionados.</p><p><strong>DELETE:</strong> baja física porque hoy no existe requisito de restauración o auditoría. Soft delete se agrega cuando aparezca ese requisito.</p></div>
      <SourceLine>Renombrado: `CategoryView.tsx:78-119`; baja de producto: `ProductsList.tsx:129-150` y `productsService.js:62-64`.</SourceLine>
    </div>
  )
}

function AuthSlide() {
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[8]} />
      <div className="split-grid auth-grid">
        <div><div className="security-flow"><div><span>LoginPage</span><small>POST email + password</small></div><ArrowRight size={17} /><div><span>usersService</span><small>scrypt + timingSafeEqual</small></div><ArrowRight size={17} /><div><span>session</span><small>req.session.userId</small></div></div><div className="auth-facts"><div><Key size={18} /><strong>No se filtra</strong><span>`password_hash` queda fuera de `publicUser`.</span></div><div><ShieldCheck size={18} /><strong>Último admin</strong><span>El backend rechaza dejar cero administradores.</span></div><div><LockKey size={18} /><strong>Cookie</strong><span>El navegador conserva el identificador, no el carrito completo.</span></div></div></div>
        <CodePanel file="usersService.js:4-40" code={'function publicUser(row) {\n  return row && {\n    id: row.id, name: row.name, email: row.email,\n    adminFlag: Boolean(row.admin_flag),\n  };\n}\n\nconst salt = crypto.randomBytes(16).toString(\'hex\');\nconst hash = crypto.scryptSync(password, salt, 64);\ncrypto.timingSafeEqual(actual, expected);'} caption="Se usa `node:crypto`; no texto plano ni hash rápido para contraseñas." />
      </div>
      <SourceLine>Login: `App.tsx:1412-1440` → `authApiController.js:8-12` → `usersService.js:35-40,126-129` → `StoreProvider.refresh`.</SourceLine>
    </div>
  )
}

function CartSlide() {
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[9]} />
      <div className="split-grid cart-grid">
        <div className="cart-model"><div className="cart-box cart-session"><span className="cart-box-label">SESIÓN</span><strong>[ productId, quantity ]</strong><p>Guarda sólo identidad y cantidad.</p></div><ArrowDown /><div className="cart-box cart-db"><span className="cart-box-label">SQLITE</span><strong>precio · stock · título</strong><p>Se relee al pedir el carrito.</p></div><div className="cart-result"><Check size={17} /> subtotal = precio vigente × cantidad</div></div>
        <div><CodePanel file="Web-1/services/cartService.js:3-40,57-83" code={'const product = productsService.getProductById(productId);\nconst unitPrice = product.price;\nreturn {\n  productId, quantity, unitPrice,\n  subtotal: unitPrice * quantity,\n};'} caption="El cliente no puede congelar precios enviando valores propios." /><CodePanel file="Web-1/services/ordersService.js:40-90" code={checkoutCode} caption="Orden, líneas y stock forman una única operación lógica." /></div>
      </div>
      <div className="metric-row"><Metric value="409" label="si se intenta superar stock" tone="coral" /><Metric value="201" label="si la compra se confirma" tone="mint" /><Metric value="DESCUENTO10" label="código validado por backend" tone="yellow" /></div>
      <SourceLine>Agregar al carrito no baja stock. El descuento se guarda en `localStorage`, pero el backend valida el código aceptado.</SourceLine>
    </div>
  )
}

function ArrowDown() {
  return <div className="arrow-down" aria-hidden="true"><span /><span /><span /></div>
}

function ReactSlide() {
  const concepts = [[SquaresFour, 'Componentes', 'Responsabilidad comprensible: Card, Button, ProductView.'], [Lightning, 'Estado', 'Snapshot + setter; nunca una variable let que la UI no observa.'], [BracketsCurly, 'Props y key', 'El padre configura; `product.id` conserva identidad estable.'], [UsersThree, 'Composición', '`children` y providers, no herencia de componentes.']] as const
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[10]} />
      <div className="concept-grid">{concepts.map(([Icon, title, text], index) => <article className="concept-card" key={title}><div className="concept-icon"><Icon size={22} weight="duotone" /></div><span className="concept-number">0{index + 1}</span><h2>{title}</h2><p>{text}</p></article>)}</div>
      <div className="split-grid react-code-grid"><CodePanel file="ProductsList.tsx" code={'const visibleProducts = products\n  .filter(matchesSearch)\n  .map((product) => (\n    <ProductCard key={product.id} product={product} />\n  ));'} caption="`key` es identidad para reconciliación, no una prop visual." /><CodePanel file="ProductView.tsx" code={controlledFormCode} caption="Formulario controlado: estado, validación, preview y envío comparten una fuente." /></div>
      <SourceLine>T1-T3 respaldados por `main.tsx`, `ProductsList.tsx`, `ProductView.tsx`, `Card.tsx` y `components/atoms`.</SourceLine>
    </div>
  )
}

function CssSlide() {
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[11]} />
      <div className="theory-columns">
        <div className="theory-block"><Palette size={21} /><h2>T4 · CSS</h2><p>CSS normal co-localizado, no CSS Modules. Variables nativas, Flexbox, Grid, media queries, pseudoclases y `prefers-reduced-motion`.</p><Tag>layout sin JS</Tag></div>
        <div className="theory-block"><Gear size={21} /><h2>T5 · Hooks</h2><p>`useState` para UI, `useEffect` para sincronización externa, Context para capacidades transversales, ref para DOM y memo sólo cuando aporta.</p><Tag tone="yellow">cleanup obligatorio</Tag></div>
        <div className="theory-block"><GitBranch size={21} /><h2>T7 · Routing</h2><p>La app usa `BrowserRouter → Routes → Route`, no `createBrowserRouter → RouterProvider → Outlet`. Ambas APIs son válidas.</p><Tag tone="coral">URL = estado</Tag></div>
      </div>
      <div className="split-grid css-footer-grid"><CodePanel file="patrón de efecto" code={'useEffect(() => {\n  window.addEventListener(\'keydown\', handleKeyDown);\n  return () => window.removeEventListener(\'keydown\', handleKeyDown);\n}, [handleKeyDown]);'} caption="Cleanup evita listeners huérfanos y duplicados." /><div className="defense-card"><Browser size={22} /><h2>Responsive real</h2><p>La sidebar se reorganiza con CSS. React sólo controla si el drawer está abierto. Imágenes usan &lt;picture&gt; y variantes AVIF.</p><SourceLine>`App.tsx:643-647` · `utils/images.ts:1-5`</SourceLine></div></div>
    </div>
  )
}

function TheorySlide() {
  const rows = [
    ['T1', 'React, JSX, SPA', 'main.tsx + App.tsx', 'React describe y reconcilia UI. Vite empaqueta.'],
    ['T2', 'Componentes, props, keys', 'atoms + ProductsList', 'La key es identidad estable, no el índice.'],
    ['T3', 'Estado, eventos, formularios', 'ProductView + providers', 'Setter agenda render; updater funcional si depende del anterior.'],
    ['T4', 'Cascada y responsive', 'index.css + CSS por pieza', 'CSS normal sigue siendo global; co-localizar no es aislar.'],
    ['T5', 'Hooks, Context, efectos', 'useTheme, useDialog, useAppState', 'Custom hook comparte lógica, no estado automáticamente.'],
    ['T6', 'Fetch, REST, errores', 'apiFetch + Express', 'fetch no falla solo por 404/500; hay que revisar response.ok.'],
    ['T7', 'Routing', 'BrowserRouter + Routes', 'Navegación interna no pide otro HTML, aunque sí puede pedir API.'],
  ]
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[12]} />
      <div className="theory-table"><div className="table-head"><span>Bloque</span><span>Concepto</span><span>Evidencia</span><span>Respuesta defendible</span></div>{rows.map(([block, concept, evidence, answer]) => <div className="theory-row" key={block}><strong>{block}</strong><span>{concept}</span><code>{evidence}</code><span>{answer}</span></div>)}</div>
      <div className="defense-note"><BookOpen size={18} /><span>La carpeta teórica se contrastó con 33 fuentes textuales y 15 referencias visuales. No todo ejemplo teórico tiene que aparecer en el mismo proyecto.</span></div>
    </div>
  )
}

function DecisionsSlide() {
  const rows = [['fetch centralizado', 'nativo y suficiente', 'Axios si aparecen interceptores complejos'], ['Context + hooks', 'poco estado global', 'Redux si crecen dominios y eventos'], ['SQLite + SQL', 'demo local y transacciones claras', 'PostgreSQL para producción distribuida'], ['Status derivado', 'una fuente de verdad', 'columna sólo si existe estado manual'], ['Data URL', 'demo sin storage adicional', 'object storage para archivos grandes'], ['CSS media queries', 'layout nativo y eficiente', 'JS si cambia comportamiento, no sólo layout']]
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[13]} />
      <div className="decision-table"><div className="table-head"><span>Decisión actual</span><span>Por qué encaja</span><span>Alternativa / techo</span></div>{rows.map(([decision, why, alt]) => <div className="decision-table-row" key={decision}><strong>{decision}</strong><span>{why}</span><span>{alt}</span><ArrowUpRight size={16} /></div>)}</div>
      <div className="finance-band"><Lightning size={20} /><div><strong>Finanzas = lógica funcional</strong><span>`Map` por producto, `reduce` para totales, exclusión de cancelados y `useMemo` para derivados. `ESTIMATED_COST_RATE = 0.65` es una estimación, no contabilidad.</span></div></div>
    </div>
  )
}

function FindingsSlide() {
  const findings = [
    ['Seguridad', 'No hay autorización efectiva en API ni guard real de `/admin`. Ocultar enlaces no protege.'],
    ['Archivos', 'No existe `/api/upload`; la imagen se convierte en Data URL local.'],
    ['Checkout', 'No persiste dirección ni notas; sólo usuario y descuento.'],
    ['Exposición', 'GET `/orders` y `/users` requieren políticas de acceso; Account filtra órdenes en cliente.'],
    ['Sesión', 'Secret hardcodeado y MemoryStore no sirven para producción distribuida.'],
    ['Persistencia', 'SQLite en `/tmp` de Vercel es efímero entre instancias o deploys.'],
    ['Consistencia', 'Categoría por nombre y actualización N+1 marcan un techo conocido.'],
    ['UI engañosa', 'En baja de producto, el catch también quita la fila local aunque falle la API.'],
  ]
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[14]} />
      <div className="finding-grid">{findings.map(([title, text], index) => <div className="finding" key={title}><span>0{index + 1}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}</div>
      <div className="warning-band"><Warning size={18} /> Estas observaciones no invalidan la arquitectura académica. Distinguen una demo funcional de un sistema listo para producción.</div>
    </div>
  )
}

function DefenseSlide() {
  const demo = ['Crear producto con categoría válida y stock 2.', 'Mostrar POST `/api/products` y respuesta 201.', 'Agregar dos unidades desde la tienda.', 'Intentar una tercera y mostrar 409.', 'Confirmar con `DESCUENTO10`.', 'Mostrar 201 con orden, subtotal y líneas.', 'Releer admin: stock 0 y `Sin Stock`.', 'Mover orden y mostrar PUT `/api/orders/:id`.', 'Releer cuenta: estado desde SQLite.']
  return (
    <div className="content-layout">
      <SlideHeader slide={slides[15]} />
      <div className="split-grid defense-grid"><div className="demo-list">{demo.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><p>{step}</p></div>)}</div><div className="defense-quote"><Check size={26} /><p>React controla el formulario y llama a `apiFetch`. Express elige controller y service. SQLite confirma. Admin y tienda convergen porque consultan la misma fuente de verdad.</p></div></div>
      <SourceLine>La compra baja stock al confirmar pedido, no al agregarlo al carrito. La cookie conserva el identificador de sesión.</SourceLine>
    </div>
  )
}

function VerificationSlide() {
  return (
    <div className="close-layout content-layout">
      <BrandLogo compact />
      <SlideHeader slide={slides[16]} />
      <div className="verification-grid"><CodePanel file="Web-1" code={'cd F:\\Escritorio\\Web-1\nnpm test'} caption="Prueba integrada: base temporal, cookie, catálogo, login, carrito, pedido, status y stats." /><CodePanel file="reactfinal" code={'cd F:\\Escritorio\\reactfinal\nnpm run typecheck\nnpm run lint\nnpm run build'} caption="La verificación del frontend separa tipos, lint y bundle." /></div>
    </div>
  )
}

function FinalSlide() {
  const flow = [['Evento UI', 'handler React'], ['handler React', 'apiFetch'], ['apiFetch', 'API router'], ['API router', 'controller'], ['controller', 'service'], ['service', 'SQLite / sesión'], ['SQLite / sesión', 'JSON'], ['JSON', 'setState + render']]
  return (
    <div className="close-layout content-layout final-layout">
      <BrandLogo compact />
      <SlideHeader slide={slides[17]} />
      <div className="memory-flow">{flow.map(([from, to], index) => <div className="memory-step" key={to}><span>{from}</span><ArrowRight size={14} /><strong>{to}</strong>{index === flow.length - 1 && <Check size={16} />}</div>)}</div>
      <div className="final-line">Pediloo: <strong>representar · validar · persistir</strong></div>
    </div>
  )
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case 'cover': return <CoverSlide />
    case 'architecture': return <ArchitectureSlide />
    case 'boot': return <BootSlide />
    case 'request': return <RequestSlide />
    case 'rest': return <RestSlide />
    case 'model': return <ModelSlide />
    case 'products': return <ProductsSlide />
    case 'domain': return <DomainSlide />
    case 'auth': return <AuthSlide />
    case 'cart': return <CartSlide />
    case 'react': return <ReactSlide />
    case 'css': return <CssSlide />
    case 'theory': return <TheorySlide />
    case 'decisions': return <DecisionsSlide />
    case 'findings': return <FindingsSlide />
    case 'defense': return <DefenseSlide />
    case 'close': return slide.id === 'verificacion' ? <VerificationSlide /> : <FinalSlide />
  }
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const currentSlide = slides[currentIndex]

  const goTo = useCallback((index: number) => setCurrentIndex(Math.max(0, Math.min(index, slides.length - 1))), [])
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const goPrevious = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') { event.preventDefault(); goNext() }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goPrevious() }
      if (event.key === 'Home') goTo(0)
      if (event.key === 'End') goTo(slides.length - 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrevious, goTo])

  useEffect(() => { document.title = `${currentSlide.label} · Pediloo` }, [currentSlide.label])

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      <main className="deck">
        <div className="grain" aria-hidden="true" /><div className="ambient-glow ambient-glow-one" aria-hidden="true" /><div className="ambient-glow ambient-glow-two" aria-hidden="true" />
        <header className="deck-header">
          <button className="brand-button" type="button" onClick={() => goTo(0)} aria-label="Volver al inicio"><BrandLogo /><span className="brand-context">/ lógica y flujo</span></button>
          <div className="header-meta"><span>Presentación técnica</span><span className="header-divider" /><span>{currentSlide.index} / {String(slides.length).padStart(2, '0')}</span></div>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.section className="slide" key={currentSlide.id} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }} transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }} aria-label={`Slide ${currentSlide.index}: ${currentSlide.label}`}>
            <SlideContent slide={currentSlide} />
          </motion.section>
        </AnimatePresence>
        <footer className="deck-footer">
          <div className="progress-wrap" aria-label="Progreso de la presentación"><div className="progress-line"><span style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }} /></div><div className="progress-labels"><span>{currentSlide.label}</span><span>{String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span></div></div>
          <div className="slide-nav"><button type="button" onClick={goPrevious} disabled={currentIndex === 0} aria-label="Diapositiva anterior"><ArrowLeft size={18} /></button><div className="slide-dots" aria-label="Seleccionar diapositiva">{slides.map((slide, index) => <button key={slide.id} type="button" className={index === currentIndex ? 'is-active' : ''} onClick={() => goTo(index)} aria-label={`Ir a ${slide.label}`} aria-current={index === currentIndex ? 'step' : undefined} />)}</div><button type="button" onClick={goNext} disabled={currentIndex === slides.length - 1} aria-label="Diapositiva siguiente"><ArrowRight size={18} /></button></div>
        </footer>
      </main>
    </MotionConfig>
  )
}

export default App
