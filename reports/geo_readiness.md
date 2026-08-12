# GEO / AEO readiness — legalcostguides.com

**Fecha:** 2026-08-12 · **Rama:** `legalcostguides-adsense-seo-geo-final-2026-08-12`

---

## 0. Punto de partida honesto

Google es explícito: **el SEO sigue siendo la base de la visibilidad en las
funciones generativas**. No existe un conjunto de factores de ranking separado
para AI Overviews ni para AI Mode, y no hay ninguna métrica pública que permita
optimizar contra ellos directamente.

Todo lo que sigue se implementó porque **mejora la utilidad y la trazabilidad
para el lector**. Que además facilite la comprensión y la citación por parte de
sistemas generativos es una consecuencia plausible, no un resultado medido.

**No se ha implementado ningún "hack GEO".** En concreto, y deliberadamente:

| Práctica descartada | Motivo |
|---|---|
| `llms.txt` | Google declara que lo ignora. No se ha creado ni se vende como ventaja. |
| Fragmentar artículos en bloques diminutos "para la IA" | Perjudica al lector. La estructura sigue el contenido. |
| Repetir preguntas literales por variante de consulta | Es *scaled content*. Se ha eliminado, no añadido. |
| Schema masivo o inventado para aparentar autoridad | Se ha **reducido** el schema, no ampliado. |
| Páginas nuevas por cada consulta *fan-out* | No se ha creado ninguna página nueva. |
| Estadísticas sintéticas presentadas como reales | Al contrario: se han retirado las no auditables. |

---

## 1. Qué dicen los datos disponibles

### EVIDENCIA

- **Search Console no expone datos de funciones generativas para esta
  propiedad.** La dimensión `searchAppearance` sobre 12-may → 11-ago 2026
  devuelve `No search analytics data found`. No hay ningún tipo de resultado
  enriquecido activo, y no existe informe de AI features accesible vía el MCP.
- **71 consultas en forma de pregunta con ≥25 impresiones** en 3 meses
  (`reports/final_geo_opportunities.csv`). Las mayores:

| Pregunta | Impresiones | Posición | URL que ya la recibe |
|---|---|---|---|
| how much does a lawyer cost | 876 | 42,1 | `/states/louisiana-lawyer-costs` |
| how much does it cost for a lawyer to represent you in court | 475 | **8,9** | `/states/new-york-lawyer-costs` |
| how much is a consultation with a lawyer | 383 | 66,0 | `/pages/lawyer-consultation-fee` |
| how much does a criminal lawyer cost | 286 | 71,8 | `/pages/criminal-defense-lawyer-cost` |
| how much does a good lawyer cost | 213 | 62,2 | `/pages/how-much-does-a-lawyer-cost` |

- **La cobertura de la dimensión consulta es del 34,3 % de las impresiones y del
  3,9 % de los clics.** El resto está anonimizado. Cualquier lectura de estas
  71 preguntas es parcial por construcción.

### INFERENCIA

- Que una página de Luisiana reciba `how much does a lawyer cost` (una consulta
  sin componente geográfico) indicaba que el texto compartido hacía encajar
  cualquier página con cualquier consulta. Eliminada esa plantilla, la
  correspondencia entre consulta y página debería estrecharse.

### NO VERIFICABLE

- Si el sitio aparece hoy en AI Overviews o AI Mode, y con qué frecuencia.
- Si alguno de los cambios altera esa aparición.

---

## 2. Qué se implementó y por qué

### 2.1 Separación explícita entre dato oficial y estimación

**El cambio de mayor peso.** Un sistema que cita necesita saber qué es un hecho
y qué es un cálculo; un lector, también.

- 285 encabezados de tabla en 57 páginas: `Typical rate band` →
  **`Planning estimate (derived)`**. Las tasas judiciales oficiales conservan su
  etiqueta y su fuente.
- Nota de metodología visible, una por página, junto a la primera tabla de
  estimaciones: qué son, de dónde salen, por qué **BLS mide salarios y empleo,
  no importes facturados al cliente**, y enlace a `/how-we-research`.
- Retiradas todas las cifras monetarias no auditables de `title` y
  `meta description` en los 50 estados.

### 2.2 Citas visibles junto a la afirmación

Las tasas judiciales de los 17 estados con datos `.gov` citan tribunal, código o
judicatura **en la propia fila de la tabla**, no en una bibliografía al final.
Enlaces salientes reales: `uscourts.gov` (119), judicaturas estatales
(`njcourts.gov`, `coloradojudicial.gov`, `law.lis.virginia.gov`,
`alison.legislature.state.al.us`, `billstatus.ls.state.ms.us`…), `bls.gov` (173),
`americanbar.org` (64), `clio.com` (197).

### 2.3 Entidades coherentes

- `Organization` + `WebSite` describen la entidad editorial real, una sola vez,
  en la home.
- `ProfilePage` + `Person` solo en el perfil del autor, con datos factuales y la
  declaración explícita de que no es abogado ni paralegal.
- **Retirado** `Article` de la home (no es un artículo), de las 6 calculadoras
  (son herramientas → `WebPage`) y del índice de estados (→ `CollectionPage`).
- **0 usos** de `LegalService`, `Attorney`, `Review`, `AggregateRating`, `HowTo`
  o `Dataset`. LegalCostGuides no presta servicios jurídicos.
- `FAQPage` pasa de 110 a 62 bloques: se retira de las páginas donde las
  preguntas eran relleno duplicado o quedaba una sola pregunta.

### 2.4 Contenido principal en el DOM inicial

El sitio es HTML estático. **No hay renderizado por JavaScript**: el contenido
principal está en el HTML servido. Verificado en las 114 páginas. Ningún schema
se inyecta por JS.

### 2.5 Estructura al servicio del lector

- `h1` único en las 114 páginas, jerarquía `h2`/`h3` coherente.
- Tablas con encabezados semánticos, unidad, jurisdicción y año.
- Anclas descriptivas: los nombres de estado de cada tabla de comparación ahora
  enlazan a su guía estatal (460 enlaces contextuales en 46 páginas).
- Accesibilidad Lighthouse **100** en las 7 páginas medidas: sin ello, ni
  lectores de pantalla ni parsers leen bien la estructura.

### 2.6 Rastreo sin obstáculos

`robots.txt` no bloquea Googlebot ni Bingbot. Solo `Disallow: /reports/`,
`/*?q=*` y `/*?s=*`. Ningún `noindex` salvo `404.html`. Sin `X-Robots-Tag`
restrictivo. **No se han tocado las reglas de crawlers de IA de terceros:**
el sitio no las tiene y añadirlas es una decisión de negocio de Javi, no una
mejora técnica.

---

## 3. Páginas con mayor potencial de citación

Criterio: la pregunta tiene volumen medido, la URL ya existe y rankea, y la
respuesta puede apoyarse en fuente primaria.

| URL | Por qué | Qué falta |
|---|---|---|
| `/states/new-york-lawyer-costs` | Ya en **posición 8,9** para "how much does it cost for a lawyer to represent you in court", 475 impresiones. Tiene datos `.gov` (nycourts.gov). | Respuesta directa a esa pregunta en las primeras líneas. |
| `/states/new-jersey-lawyer-costs` | 30 clics, posición 11,5, datos `.gov` verificados. | — |
| `/pages/how-much-does-a-lawyer-cost` | Hub natural; recibe "how much does a good lawyer cost", "how much does an attorney cost". | Posición 59: el problema es de autoridad, no de formato. |
| Los 17 estados con datos `.gov` | Únicas páginas del sitio con cifras trazables a fuente primaria. | Son el activo real del sitio. |

**No se han creado páginas nuevas para ninguna de estas preguntas.** La
recomendación es responderlas dentro de la URL que ya las recibe.

---

## 4. Cómo medir esto sin inventar un "GEO score"

No existe una métrica pública de citación en AI Overviews. Lo que sí se puede
medir, todo en Search Console:

1. **`searchAppearance`**: hoy vacío. Si aparece cualquier tipo, es señal real.
2. **CTR por posición**: la curva de este sitio era casi plana entre las
   posiciones 6 y 20 (1,23 % a 0,98 %), señal de desajuste entre lo que promete
   el resultado y lo que el usuario busca. Si la curva empieza a inclinarse, la
   correspondencia ha mejorado.
3. **Impresiones de las 71 preguntas** de `final_geo_opportunities.csv`.
4. **Posición media de `/states/`**: 18,1 en 3 meses, 15,9 en 28 días.
5. **Reparto `/states/` vs `/pages/`**: hoy 726 vs 10 clics.

Lo que **no** debe hacerse: atribuir cualquier cambio de tráfico a "GEO". Sin
un informe de funciones generativas, esa atribución no es demostrable.
