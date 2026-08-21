# Sistema visual de la presentación Pediloo

## Trabajo de comunicación

Al terminar la defensa, los profesores deben poder reconstruir el recorrido de un dato porque cada diapositiva conecta teoría, código real y una consecuencia observable.

## Lectura de diseño

Presentación técnica para docentes, con una estética sobria, alto contraste y evidencia legible. Se preserva la marca Pediloo y se reemplaza la estructura tipo dashboard por composiciones más planas.

## Diales

- `DESIGN_VARIANCE: 4`: estructura estable con pequeñas diferencias entre diapositivas.
- `MOTION_INTENSITY: 3`: transición corta de opacidad y desplazamiento; sin animación decorativa.
- `VISUAL_DENSITY: 4`: diez diapositivas para 6-8 minutos, con una sola idea principal por pantalla.

## Narrativa

1. Pediloo como proyecto integrado.
2. Dos procesos separados por HTTP.
3. El ciclo declarativo de React.
4. Puente API de ida.
5. Backend y puente de regreso.
6. Contrato REST y validación.
7. Carrito, stock y transacción.
8. Problemática de infraestructura: SQLite local frente a instancias serverless.
9. Seguridad y límites.
10. Demostración verificable y síntesis.

## Plan de exposición

- Diapositivas 1 y 2, contexto y arquitectura: 1 minuto.
- Diapositiva 3, modelo mental de React: 50 segundos.
- Diapositivas 4 y 5, puente HTTP completo: 1 minuto.
- Diapositiva 6, contrato REST: 45 segundos.
- Diapositiva 7, regla central de compra: 1 minuto.
- Diapositiva 8, persistencia distribuida y sincronización: 55 segundos.
- Diapositiva 9, seguridad y límites: 45 segundos.
- Diapositiva 10, demostración y cierre: 1 minuto y 10 segundos.

Duración objetivo: entre 6 y 7 minutos. Si hay preguntas durante la defensa, la guía de estudio conserva el detalle que se retiró de las diapositivas.

## Identidad visual

- Logo real: `public/brand/logoheader.png`.
- Display y cuerpo: Space Grotesk Variable.
- Código y rutas: JetBrains Mono Variable.
- Tema único oscuro.
- Acento principal: verde Pediloo.
- Amarillo: frontera o persistencia, sin competir con el acento.
- Coral: únicamente errores, conflictos y riesgos.
- Radio único de 12 px para superficies; botones circulares sólo por función de navegación.

## Composición

- Ancho máximo de contenido: 1180 px.
- Títulos directos, de una o dos líneas.
- Texto de apoyo limitado a una oración.
- Diagramas planos para los dos recorridos del puente.
- Código limitado a 4-8 líneas, siempre acompañado por archivo y líneas.
- Tablas largas y listas exhaustivas quedan en la guía de estudio, no en la presentación.
- La portada usa el logo real y una secuencia tipográfica. No simula una interfaz de producto.

## Movimiento y accesibilidad

- Flechas, espacio, Page Up/Down, Home y End conservan su comportamiento.
- La transición entre diapositivas dura 220 ms y comunica cambio de estado.
- `prefers-reduced-motion` elimina desplazamientos.
- Todos los botones mantienen foco visible y nombres accesibles.
- Los paneles de código permiten desplazamiento horizontal en pantallas pequeñas.

## Verificación requerida

- `npm run lint`.
- `npm run build`.
- Revisión visual de las diez diapositivas en 1366x768 y 1920x1080.
- Revisión móvil a 390x844.
- Cero overflow, títulos cortados o errores de consola.
- Contador final `10 / 10` y navegación completa por teclado.
