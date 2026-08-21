import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Browser,
  Check,
  Code,
  Cookie,
  Database,
  FileText,
  Fingerprint,
  GitBranch,
  Key,
  LockKey,
  Package,
  ShieldCheck,
  ShoppingBagOpen,
  Stack,
  TerminalWindow,
  Warning,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react'
import './App.css'

type SlideKind =
  | 'cover'
  | 'system'
  | 'react'
  | 'bridgeOut'
  | 'bridgeBack'
  | 'rest'
  | 'checkout'
  | 'infrastructure'
  | 'security'
  | 'demo'

type Slide = {
  id: string
  label: string
  title: string
  description: string
  kind: SlideKind
  eyebrow?: string
}

const slides: Slide[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    eyebrow: 'DEFENSA DE PROYECTO',
    title: 'Pediloo se entiende siguiendo el dato.',
    description: 'React representa. Express valida. SQLite persiste.',
    kind: 'cover',
  },
  {
    id: 'sistema',
    label: 'Sistema',
    title: 'Dos aplicaciones forman un solo sistema.',
    description: 'El navegador y el servidor se comunican por HTTP. No comparten funciones ni memoria.',
    kind: 'system',
  },
  {
    id: 'react',
    label: 'React',
    title: 'React convierte interacción en una nueva vista.',
    description: 'Componentes, estado, eventos, efectos y rutas organizan la experiencia del cliente.',
    kind: 'react',
  },
  {
    id: 'puente-salida',
    label: 'Puente API',
    eyebrow: 'PUENTE API. IDA',
    title: 'apiFetch transforma una intención en HTTP.',
    description: 'La frontera del navegador termina cuando fetch envía método, URL, headers, body y cookie.',
    kind: 'bridgeOut',
  },
  {
    id: 'puente-regreso',
    label: 'Puente API',
    title: 'Express procesa; React vuelve a renderizar.',
    description: 'La respuesta recorre las mismas capas en sentido inverso hasta convertirse en estado visible.',
    kind: 'bridgeBack',
  },
  {
    id: 'rest',
    label: 'REST',
    title: 'Método y URI definen el contrato.',
    description: 'El controller protege la frontera HTTP y el service concentra las reglas reutilizables.',
    kind: 'rest',
  },
  {
    id: 'compra',
    label: 'Compra',
    title: 'La compra confirma todo o no confirma nada.',
    description: 'El carrito conserva lo mínimo; SQLite decide precio, stock y resultado final.',
    kind: 'checkout',
  },
  {
    id: 'infraestructura',
    label: 'Infraestructura',
    eyebrow: 'PROBLEMÁTICA DE INFRAESTRUCTURA',
    title: 'SQLite puede guardar el dato y aun así no compartirlo.',
    description: 'En local POST y GET usan el mismo archivo; en serverless cada instancia puede tener su propio `/tmp`.',
    kind: 'infrastructure',
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    title: 'La identidad está resuelta; falta aplicar permisos.',
    description: 'Hash, sesión y DTO público protegen credenciales, pero los endpoints sensibles todavía necesitan guards.',
    kind: 'security',
  },
  {
    id: 'cierre',
    label: 'Defensa',
    eyebrow: 'DEMO Y VERIFICACIÓN',
    title: 'Una operación permite defender todo el sistema.',
    description: 'Crear, comprar y releer demuestra React, HTTP, reglas de negocio y persistencia.',
    kind: 'demo',
  },
]

const apiFetchCode = [
  'const response = await fetch(`${API_BASE_URL}${endpoint}`, {',
  '  ...options,',
  '  headers,',
  "  credentials: 'include',",
  '});',
  'const text = await response.text();',
  'const data = text ? JSON.parse(text) as unknown : null;',
].join('\n')

const productEffectCode = [
  "const data = await apiFetch<Product[]>('/products');",
  'if (Array.isArray(data)) {',
  '  const normalized = data.map(p => ({',
  '    ...p,',
  '    status: normalizeStatus(p.status)',
  '  }));',
  '  setProducts(normalized);',
].join('\n')

const productInsertCode = [
  'const result = db.prepare(`',
  '  INSERT INTO products (title, description, price, src, category, isTopSeller, stock)',
  '  VALUES (?, ?, ?, ?, ?, ?, ?)',
  '`).run(',
].join('\n')

const stockUpdateCode = [
  'const reduceStock = db.prepare(`',
  '  UPDATE products SET stock = stock - ?',
  '  WHERE id = ? AND stock >= ?',
  '`);',
  '',
  'for (const item of detail.items) {',
  '  const stockResult = reduceStock.run(item.quantity, item.productId, item.quantity);',
  '  if (stockResult.changes !== 1) {',
].join('\n')

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <img className={compact ? 'brand-logo brand-logo-compact' : 'brand-logo'} src="/brand/logoheader.png" alt="Pediloo" />
}

function SlideHeader({ slide }: { slide: Slide }) {
  return (
    <div className="slide-heading">
      {slide.eyebrow && <p className="eyebrow">{slide.eyebrow}</p>}
      <h1>{slide.title}</h1>
      <p className="slide-description">{slide.description}</p>
    </div>
  )
}

function SourceLine({ children }: { children: React.ReactNode }) {
  return <p className="source-line"><FileText size={15} /> {children}</p>
}

function CodePanel({ file, code, caption }: { file: string; code: string; caption?: string }) {
  return (
    <div className="code-panel">
      <div className="code-panel-head"><span>{file}</span><Code size={16} /></div>
      <pre><code>{code}</code></pre>
      {caption && <p className="code-caption"><Check size={15} weight="bold" /> {caption}</p>}
    </div>
  )
}

function FlowNode({ icon: Icon, title, detail, tone = 'mint' }: { icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'duotone' }>; title: string; detail: string; tone?: 'mint' | 'yellow' | 'coral' }) {
  return (
    <div className={`flow-node flow-node-${tone}`}>
      <Icon size={24} weight="duotone" />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

function FlowArrow({ label }: { label?: string }) {
  return <div className="flow-arrow">{label && <span>{label}</span>}<ArrowRight size={21} /></div>
}

function CoverSlide() {
  return (
    <div className="cover-layout">
      <div className="cover-copy">
        <BrandLogo />
        <SlideHeader slide={slides[0]} />
        <div className="cover-proof">
          <span>React 19</span><span>Express 5</span><span>SQLite</span>
        </div>
      </div>
      <div className="cover-route" aria-label="Flujo principal de Pediloo">
        <div><span>01</span><strong>React</strong><small>representa</small></div>
        <ArrowRight size={24} />
        <div><span>02</span><strong>Express</strong><small>valida</small></div>
        <ArrowRight size={24} />
        <div><span>03</span><strong>SQLite</strong><small>persiste</small></div>
      </div>
    </div>
  )
}

function SystemSlide() {
  return (
    <div className="content-layout system-slide">
      <SlideHeader slide={slides[1]} />
      <div className="system-composition">
        <section className="system-side browser-side">
          <Browser size={32} weight="duotone" />
          <p>Proceso del navegador</p>
          <h2>reactfinal</h2>
          <span>Componentes, rutas, eventos y estado.</span>
        </section>
        <div className="system-bridge"><ArrowRight size={30} /><strong>HTTP + JSON</strong><span>cookie de sesión</span></div>
        <section className="system-side server-side">
          <TerminalWindow size={32} weight="duotone" />
          <p>Proceso Node.js</p>
          <h2>Web-1</h2>
          <span>Express, reglas, sesión y SQLite.</span>
        </section>
      </div>
      <div className="statement-band"><LockKey size={21} /><strong>Separación real:</strong><span>React no importa controllers ni abre `database.db`. Sólo conoce una URL HTTP.</span></div>
      <SourceLine>`reactfinal/src/utils/api.ts:1,33-58` | `Web-1/app.js:32-44,67-78` | `Web-1/db/database.js:7-20`.</SourceLine>
    </div>
  )
}

function ReactSlide() {
  const concepts = [
    ['Componentes + props', 'Componen la interfaz y reciben datos.'],
    ['Estado + eventos', 'El usuario dispara cambios con handlers.'],
    ['useEffect', 'Sincroniza la UI con una fuente externa.'],
    ['BrowserRouter', 'La URL decide qué pantalla se representa.'],
  ]
  return (
    <div className="content-layout react-slide">
      <SlideHeader slide={slides[2]} />
      <div className="react-composition">
        <div className="concept-list">
          {concepts.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
        </div>
        <CodePanel file="ProductsList.tsx:106-112" code={productEffectCode} caption="La petición ocurre en un efecto; setProducts agenda un nuevo render." />
      </div>
      <div className="react-cycle"><span>evento</span><ArrowRight /><span>handler</span><ArrowRight /><span>setState</span><ArrowRight /><span>render</span><ArrowRight /><span>DOM</span></div>
      <SourceLine>El proyecto también usa formularios controlados en `ProductView.tsx:287-431` y rutas con React Router en `App.tsx`.</SourceLine>
    </div>
  )
}

function BridgeOutSlide() {
  return (
    <div className="content-layout bridge-slide">
      <SlideHeader slide={slides[3]} />
      <div className="process-labels"><span><Browser size={17} /> NAVEGADOR</span><span><TerminalWindow size={17} /> SERVIDOR</span></div>
      <div className="bridge-flow bridge-flow-out">
        <FlowNode icon={ShoppingBagOpen} title="Evento o efecto" detail="guardar o cargar" />
        <FlowArrow />
        <FlowNode icon={Code} title="apiFetch" detail="endpoint + options" />
        <FlowArrow />
        <FlowNode icon={Browser} title="fetch" detail="URL + headers + body" />
        <FlowArrow label="HTTP" />
        <FlowNode icon={TerminalWindow} title="Express /api" detail="recibe la request" tone="yellow" />
      </div>
      <div className="bridge-evidence">
        <CodePanel file="reactfinal/src/utils/api.ts:43-49" code={apiFetchCode} caption="El helper compone la URL, incluye la cookie y decodifica el JSON." />
        <div className="bridge-explainer">
          <div><strong>URL</strong><span>`API_BASE_URL + endpoint`</span></div>
          <div><strong>Body</strong><span>`JSON.stringify(payload)`</span></div>
          <div><strong>Sesión</strong><span>`credentials: 'include'`</span></div>
          <div><strong>Header</strong><span>`Content-Type: application/json`</span></div>
          <p><Cookie size={20} /> La cookie `httpOnly` viaja con el navegador. React no necesita leerla.</p>
        </div>
      </div>
    </div>
  )
}

function BridgeBackSlide() {
  return (
    <div className="content-layout bridge-slide bridge-back-slide">
      <SlideHeader slide={slides[4]} />
      <div className="server-pipeline">
        <FlowNode icon={TerminalWindow} title="/api" detail="app.js" tone="yellow" />
        <FlowArrow />
        <FlowNode icon={GitBranch} title="router" detail="método + URI" tone="yellow" />
        <FlowArrow />
        <FlowNode icon={ShieldCheck} title="controller" detail="valida HTTP" tone="yellow" />
        <FlowArrow />
        <FlowNode icon={Stack} title="service" detail="regla + SQL" tone="yellow" />
        <FlowArrow />
        <FlowNode icon={Database} title="SQLite" detail="fuente de verdad" tone="yellow" />
      </div>
      <div className="return-line"><span>SQLite</span><ArrowRight /><span>service</span><ArrowRight /><span>res.json()</span><ArrowRight /><span>response.ok</span><ArrowRight /><span>setProducts</span><ArrowRight /><strong>render</strong></div>
      <div className="bridge-back-evidence">
        <div className="request-example">
          <span>GET /api/products</span>
          <p>El router selecciona `getAll`; el service devuelve filas; React guarda el array.</p>
        </div>
        <div className="request-example request-example-create">
          <span>POST /api/products</span>
          <p>El controller valida el body y el service ejecuta un INSERT parametrizado.</p>
        </div>
        <CodePanel file="productsService.js:27-30" code={productInsertCode} caption="Los valores viajan separados de la estructura SQL." />
      </div>
      <SourceLine>`api.router.js:16-20` | `productsApiController.js:73-108` | `productsService.js:22-40` | `ProductsList.tsx:106-112`.</SourceLine>
    </div>
  )
}

function RestSlide() {
  const rows = [
    ['GET', '/api/products', 'leer', '200'],
    ['POST', '/api/products', 'crear', '201 / 400'],
    ['PUT', '/api/products/:id', 'actualizar', '200 / 404'],
    ['DELETE', '/api/products/:id', 'eliminar', '200 / 404'],
  ]
  return (
    <div className="content-layout rest-slide">
      <SlideHeader slide={slides[5]} />
      <div className="rest-composition">
        <div className="rest-table">
          <div className="rest-head"><span>Método</span><span>URI</span><span>Intención</span><span>Status</span></div>
          {rows.map(([method, uri, intent, status]) => <div className="rest-row" key={method}><strong>{method}</strong><code>{uri}</code><span>{intent}</span><b>{status}</b></div>)}
        </div>
        <div className="trust-boundary">
          <div><Browser size={23} /><strong>Frontend</strong><span>Valida para evitar errores y dar feedback inmediato.</span></div>
          <ArrowRight size={24} />
          <div><ShieldCheck size={23} /><strong>Backend</strong><span>Vuelve a validar porque cualquier cliente puede llamar la API.</span></div>
        </div>
      </div>
      <div className="rest-notes">
        <p><strong>400</strong> dato inválido</p><p><strong>404</strong> recurso ausente</p><p><strong>409</strong> conflicto con el estado actual</p>
      </div>
      <div className="statement-band"><Cookie size={21} /><span>Pediloo usa recursos y verbos REST; `cookie-session` conserva el identificador y el carrito entre requests.</span></div>
    </div>
  )
}

function CheckoutSlide() {
  return (
    <div className="content-layout checkout-slide">
      <SlideHeader slide={slides[6]} />
      <div className="checkout-composition">
        <div className="cart-truth">
          <section><span>SESIÓN</span><strong>{'{ productId, quantity }'}</strong><p>No guarda precio ni subtotal.</p></section>
          <ArrowRight size={25} />
          <section><span>SQLITE</span><strong>precio + stock + título</strong><p>Se releen antes de comprar.</p></section>
        </div>
        <CodePanel file="ordersService.js:73-82" code={stockUpdateCode} caption="Comprobación y descuento ocurren en la misma instrucción SQL." />
      </div>
      <div className="transaction-flow"><span>crear orden</span><ArrowRight /><span>descontar stock</span><ArrowRight /><span>insertar líneas</span><ArrowRight /><strong>commit</strong></div>
      <div className="checkout-rule"><Warning size={20} /><span>Si una línea no tiene stock, se lanza `409` y la transacción revierte todo. El carrito se vacía sólo después del commit.</span></div>
      <SourceLine>`cartService.js:11-50,57-108` | `ordersService.js:40-90`. Agregar al carrito no baja stock.</SourceLine>
    </div>
  )
}

function InfrastructureSlide() {
  return (
    <div className="content-layout infrastructure-slide">
      <SlideHeader slide={slides[7]} />
      <div className="infra-comparison">
        <section className="infra-panel infra-panel-local">
          <div className="infra-panel-heading">
            <Database size={25} weight="duotone" />
            <div><span>DESARROLLO LOCAL</span><h2>Una instancia</h2></div>
          </div>
          <div className="infra-flow">
            <div><strong>POST</strong><small>crear producto o categoría</small></div>
            <ArrowRight size={20} />
            <div><strong>database.db</strong><small>archivo compartido</small></div>
            <ArrowRight size={20} />
            <div><strong>GET</strong><small>misma instancia</small></div>
          </div>
          <div className="infra-outcome infra-outcome-ok"><Check size={17} weight="bold" /> POST → GET: aparece al releer.</div>
        </section>
        <section className="infra-panel infra-panel-serverless">
          <div className="infra-panel-heading">
            <Warning size={25} weight="duotone" />
            <div><span>VERCEL / SERVERLESS</span><h2>Instancias separadas</h2></div>
          </div>
          <div className="infra-flow">
            <div><strong>POST</strong><small>instancia A</small></div>
            <ArrowRight size={20} />
            <div><strong>/tmp</strong><small>local y efímero</small></div>
            <ArrowRight size={20} />
            <div><strong>GET</strong><small>instancia B</small></div>
          </div>
          <div className="infra-outcome infra-outcome-risk"><Warning size={17} /> Puede devolver catálogo viejo o no encontrar el dato.</div>
        </section>
      </div>
      <div className="infra-bottom">
        <div className="infra-example">
          <span>EJEMPLO PARA LA DEFENSA</span>
          <strong>Crear → cambiar de sesión → listar</strong>
          <p>El `POST` puede responder `201`, pero otro `GET` puede caer en una instancia que no comparte ese archivo.</p>
        </div>
        <div className="infra-example infra-example-solution">
          <span>DIAGNÓSTICO Y SALIDA</span>
          <strong>No es una demora de SQLite.</strong>
          <p>La UI carga las listas al montar y `apiFetch` no fuerza `no-store`. Producción: base externa compartida.</p>
        </div>
      </div>
      <SourceLine>`Web-1/db/database.js:7-12` | `Web-1/app.js:9,32-44` | `reactfinal/src/utils/api.ts:33-58` | `ProductsList.tsx:102-128`.</SourceLine>
    </div>
  )
}

function SecuritySlide() {
  const resolved = [
    [Key, 'Contraseña', 'sal aleatoria + scrypt'],
    [Fingerprint, 'Comparación', 'timingSafeEqual'],
    [LockKey, 'Respuesta', 'publicUser omite el hash'],
    [Cookie, 'Sesión', 'cookie-session + httpOnly'],
  ] as const
  const limits = [
    'No hay guards de sesión y rol en CRUD, usuarios ni pedidos.',
    'El secret tiene un fallback escrito en el código; debe venir del entorno.',
    'SQLite vive en `/tmp` al desplegar en Vercel.',
    'Producto y categoría se relacionan por nombre, no por FK.',
  ]
  return (
    <div className="content-layout security-slide">
      <SlideHeader slide={slides[8]} />
      <div className="security-composition">
        <section className="resolved-security">
          <h2>Resuelto en el código</h2>
          {resolved.map(([Icon, title, text]) => <div key={title}><Icon size={21} /><strong>{title}</strong><span>{text}</span></div>)}
        </section>
        <section className="known-limits">
          <h2>Límites conocidos</h2>
          {limits.map((limit) => <p key={limit}><Warning size={18} />{limit}</p>)}
        </section>
      </div>
      <div className="auth-distinction"><span><strong>Autenticar</strong> identifica quién es la persona.</span><ArrowRight size={24} /><span><strong>Autorizar</strong> decide qué puede hacer.</span></div>
      <SourceLine>`usersService.js:4-40,82-128` | `authApiController.js:3-22` | endpoints sin middleware en `api.router.js:16-49`.</SourceLine>
    </div>
  )
}

function DemoSlide() {
  const demo = [
    ['Crear', 'Producto con stock 2', 'POST 201'],
    ['Agregar', 'Dos unidades al carrito', 'sesión'],
    ['Exceder', 'Intentar una tercera', '409'],
    ['Comprar', 'Confirmar con descuento', 'POST 201'],
    ['Comprobar', 'Releer stock y status', 'SQLite'],
  ]
  return (
    <div className="content-layout demo-slide">
      <BrandLogo compact />
      <SlideHeader slide={slides[9]} />
      <div className="demo-composition">
        <div className="demo-path">
          {demo.map(([verb, detail, result], index) => <div key={verb}><span>{String(index + 1).padStart(2, '0')}</span><strong>{verb}</strong><p>{detail}</p><code>{result}</code></div>)}
        </div>
        <div className="verification-box">
          <Package size={25} weight="duotone" />
          <h2>Prueba integrada</h2>
          <pre><code>{'cd F:\\Escritorio\\Web-1\nnpm test'}</code></pre>
          <p>HTTP, cookie, catálogo, login, carrito, pedido, status y estadísticas.</p>
          <span><Check size={17} weight="bold" /> 1 prueba aprobada, 0 fallas</span>
        </div>
      </div>
      <div className="closing-line"><strong>React representa.</strong><strong>Express valida.</strong><strong>SQLite persiste.</strong></div>
    </div>
  )
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case 'cover': return <CoverSlide />
    case 'system': return <SystemSlide />
    case 'react': return <ReactSlide />
    case 'bridgeOut': return <BridgeOutSlide />
    case 'bridgeBack': return <BridgeBackSlide />
    case 'rest': return <RestSlide />
    case 'checkout': return <CheckoutSlide />
    case 'infrastructure': return <InfrastructureSlide />
    case 'security': return <SecuritySlide />
    case 'demo': return <DemoSlide />
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

  useEffect(() => { document.title = `${currentSlide.label} | Pediloo` }, [currentSlide.label])

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
      <main className="deck">
        <header className="deck-header">
          <button className="brand-button" type="button" onClick={() => goTo(0)} aria-label="Volver al inicio"><BrandLogo compact /><span>lógica y flujo</span></button>
          <div className="header-meta"><span>Presentación técnica</span><strong>{String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</strong></div>
        </header>
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            className="slide"
            key={currentSlide.id}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`Diapositiva ${currentIndex + 1}: ${currentSlide.label}`}
          >
            <SlideContent slide={currentSlide} />
          </motion.section>
        </AnimatePresence>
        <footer className="deck-footer">
          <div className="slide-position"><span>{currentSlide.label}</span><strong>{String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</strong></div>
          <nav className="slide-nav" aria-label="Navegación de diapositivas">
            <button type="button" onClick={goPrevious} disabled={currentIndex === 0} aria-label="Diapositiva anterior"><ArrowLeft size={19} /></button>
            <div className="slide-dots">{slides.map((slide, index) => <button key={slide.id} type="button" className={index === currentIndex ? 'is-active' : ''} onClick={() => goTo(index)} aria-label={`Ir a ${slide.label}`} aria-current={index === currentIndex ? 'step' : undefined} />)}</div>
            <button type="button" onClick={goNext} disabled={currentIndex === slides.length - 1} aria-label="Diapositiva siguiente"><ArrowRight size={19} /></button>
          </nav>
        </footer>
      </main>
    </MotionConfig>
  )
}

export default App
