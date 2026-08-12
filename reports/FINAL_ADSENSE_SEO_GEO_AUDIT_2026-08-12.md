# Auditoría final AdSense + SEO + GEO — legalcostguides.com

**Fecha:** 2026-08-12 · **Rama:** `legalcostguides-adsense-seo-geo-final-2026-08-12`
**Base:** `a3a8187` (= `main` = `origin/main`) · **HEAD:** `918d65f` · **14 commits**

---

# VEREDICTO

# GO — READY TO DEPLOY

El código, el contenido y las pruebas están listos. **No es `READY TO REAPPLY`
porque no tengo autorización para hacer merge ni desplegar, y producción sigue
sirviendo el service worker de Monetag.**

No solicites la revisión de AdSense todavía. Secuencia en
`reports/MANUAL_ACTIONS_FOR_JAVI.md`: desplegar → verificar → esperar 28 días.

---

## 1. Estado inicial verificado (Fase 0)

| Elemento | Realidad comprobada |
|---|---|
| Rama de trabajo previa | `seo-adsense-recovery-2026-08-12`, 8 commits, **sin publicar** |
| `main` | `a3a8187`, idéntico a `origin/main` |
| Working tree | limpio, 0 cambios sin guardar |
| Trabajo más completo | la rama anterior → la rama final parte de ahí, no de `main` |
| Stack | HTML/CSS/JS **estático plano**. Sin generador, sin `package.json`, sin build |
| Despliegue | Cloudflare Pages, integración git en `main` |
| Baseline de build/tests | **No procede: no hay build ni tests.** No es un fallo preexistente, es que el proyecto no los tiene |

**No se ha reaplicado nada mecánicamente.** Se verificó qué cambios de la
primera pasada ya estaban presentes antes de tocar nada.

### Sobre la entrega anterior

La auditoría previa decía haber modificado 117–122 archivos. **Comprobado y
cierto**, pero incompleto en un punto que se corrige aquí: la medición de
duplicación contaba solo elementos `<p>` y **no alcanzaba los bloques FAQ**. La
cifra "82 % → 0 %" era correcta para párrafos y falsa para la página entera.
Ver §3.1.

---

## 2. Search Console (Fase 1)

Propiedad `sc-domain:legalcostguides.com`. Dimensión *página*, cobertura 100 %.

| Periodo | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| Todo el histórico (21-abr → 11-ago) | 773 | 99.879 | 0,77 % | 20,8 |
| 3 meses (12-may → 11-ago) | 739 | 89.860 | 0,82 % | 22,0 |
| 28 días (15-jul → 11-ago) | **407** | **44.154** | 0,92 % | **15,9** |
| 28 días previos (17-jun → 14-jul) | 228 | 26.814 | 0,85 % | 25,2 |

**28d vs 28d previos: clics +78,5 %, impresiones +64,7 %, posición de 25,2 a
15,9.** Mensual: abril 5 · mayo 59 · junio 140 · **julio 394** · agosto (11 d) 175.

- **16 meses:** no aplican. La primera impresión registrada es del **2026-04-21**.
  El sitio tiene ~4 meses de historial. No he inventado periodos que no existen.
- **País:** EE. UU. concentra el **96,5 % de las impresiones (81.445) y el 99 %
  de los clics (720)**.
- **Dispositivo:** móvil 372 clics / pos. 10,6 · escritorio 355 / pos. 29,5.
- **Sitemap:** `Valid`, 113 URLs, 0 errores.
- **`searchAppearance`:** **sin datos**. No hay ningún tipo de resultado
  enriquecido activo ni informe de funciones generativas accesible. No lo he
  inventado.
- **Core Web Vitals de campo:** el MCP no los expone para esta propiedad.
  Medición de laboratorio en §7.

### Limitación que condiciona todo el análisis de consultas

**La dimensión *consulta* cubre el 34,3 % de las impresiones y el 3,9 % de los
clics** (28.913 de 84.389; 28 de 727). La consulta con más clics en 3 meses
tiene **4**. Por eso:

- No se puede construir una curva de CTR esperado por consulta. Solo 147 filas
  consulta×página superan 30 impresiones y casi todas están en posición 26+ con
  0 clics. **No he fabricado esa curva.**
- La priorización se hace **a nivel de página**, con cobertura del 100 %, contra
  el CTR mediano observado del propio sitio por banda de posición.

**Baseline propio de CTR** (páginas con ≥300 impresiones): pos. 6–10 → 1,23 % ·
11–15 → 1,09 % · 16–20 → 0,98 % · 21–25 → 0,66 % · 26+ → 0,19 %.
**Casi plano entre las posiciones 6 y 20.** Diagnóstico central: el sitio
aparece para consultas cuya intención no termina de satisfacer.

### Reparto por sección (3 meses)

| Sección | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| `/states/` | **726** | 80.089 | 0,91 % | 18,1 |
| `/pages/` | 10 | 9.298 | 0,11 % | 53,8 |

Las 20 URLs prioritarias, en `reports/final_seo_opportunities.csv`. Encabezan
Connecticut, Pennsylvania, Missouri, South Dakota y Arkansas: todas en posición
8,6–13,6 con más de 1.300 impresiones y CTR por debajo de la mediana de su banda.

---

## 3. Qué encontré y qué cambié

### 3.1 Duplicación en bloques FAQ — no detectada en la primera pasada

**EVIDENCIA:** 26 pares pregunta+respuesta **idénticos** repartidos en más de 3
páginas cada uno. Los 6 mayores aparecían en **35–39 páginas**. 292 instancias,
46.971 caracteres. **35 páginas tenían el bloque FAQ duplicado al 100 %**: las 7
de plantilla de `/states/` (FL, GA, IL, MI, OH, PA, TX) y 28 de `/pages/`.

Además, 5 preguntas y respuestas idénticas en `about`, `terms`,
`privacy-policy`, `disclaimer` y `sitemap` ("Does this page provide legal
advice?", "How often is this page reviewed?"…), visibles y en el JSON-LD.

**CAMBIO:** eliminados los 292 bloques duplicados. 35 páginas se quedan sin FAQ
(se retira la sección vacía y su `FAQPage`). **No se han inventado preguntas de
sustitución.** El `FAQPage` restante se regeneró para reflejar exactamente las
preguntas visibles.

**Resultado:** 0 pares FAQ compartidos por más de 3 páginas.

### 3.2 Cifras no auditables presentadas como hechos (las "34 NO_VERIFICABLE")

**EVIDENCIA:** los rangos de tarifa proceden de **Clio Lawyer Rates** (fuente
comercial secundaria) y de **BLS OES**. BLS mide salarios y empleo de abogados,
**no importes facturados al cliente**: no prueba una tarifa. Se presentaban como
`Typical rate band` en tablas, y desde la primera pasada también en los `title`.

**CAMBIOS:**

- **50 titles** de estado: eliminado el rango monetario.
  `Ohio Lawyer Costs 2026: $199-$317/hr by Metro` → `Ohio Lawyer Costs 2026: Rates, Retainers & Fees`
- **50 meta descriptions**: eliminado el rango horario y el límite de small
  claims no citado. Sustituidos por elementos verificables y distintos por
  estado (judicatura en los 17 con datos `.gov`, colegio de abogados en el
  resto), cerrando con "Planning estimates, not quotes".
- **285 encabezados de tabla** en 57 páginas: `Typical rate band` →
  **`Planning estimate (derived)`**. Ningún encabezado de tasa judicial oficial
  se ha tocado.
- **Nota de metodología visible**, una por página (57): qué son, de dónde salen,
  por qué BLS solo sirve de contraste laboral, y enlace a `/how-we-research`.

Es una excepción deliberada a la regla de no repetir texto: es una divulgación
obligatoria, equivalente a un disclaimer, y ocupa ~7 % de la página mediana.

**Estado final** (`reports/final_truth_source_audit.csv`, 120 filas):

| Estado | Nº |
|---|---|
| `VERIFIED` | 20 |
| `DERIVED_AND_DISCLOSED` | 97 |
| `UNVERIFIED_REMOVE` | 2 |
| `CONTEXT_MISMATCH` (corregido) | 1 |

**Cero afirmaciones centrales presentadas como hechos sin respaldo.** Lo que no
se pudo verificar no se ha borrado del sitio: se ha reetiquetado como estimación
derivada, con su método a la vista.

### 3.3 Schema semánticamente incorrecto

| Antes | Después | Motivo |
|---|---|---|
| `Article` en la home | retirado | La home no es un artículo. Conserva `WebSite` + `Organization` |
| `Article` en 6 calculadoras | `WebPage` | Son herramientas |
| `Article` en `/states/` índice | `CollectionPage` | Es un índice |
| `FAQPage` ×110 | ×62 | Retirado donde las preguntas eran relleno duplicado o quedaba una sola |

- **0 usos** de `LegalService`, `Attorney`, `Review`, `AggregateRating`, `HowTo`
  o `Dataset`. LegalCostGuides no presta servicios jurídicos.
- **0 `reviewedBy`.** Nadie ha revisado el contenido como experto.
- Las 291 entradas de `reports/schema_semantic_audit.csv` salen **OK**: tipo
  acorde al contenido, `url` coincidente con la canonical, y todas las preguntas
  del `FAQPage` verificadas como visibles en su página.

### 3.4 Regresión de enlazado interno que yo mismo introduje

**EVIDENCIA:** el grafo antes/después mostró que **46 de las 52 páginas de
`/pages/` se habían quedado con CERO enlaces a `/states/`**, y que CA, FL, IL,
NY y TX perdían 92 enlaces entrantes cada una. Causa: el párrafo de plantilla
que eliminé en la primera pasada era el único camino de enlace hacia las
páginas de estado, que son el **98 % del tráfico**.

**CAMBIO:** los nombres de estado de la tabla *State-by-State Comparison* que
cada página ya mostraba pasan a ser enlaces a su guía estatal. **460 enlaces
contextuales en 46 páginas**, distintos en cada una: no reintroduce duplicación.

**Resultado:** enlaces internos totales 8.422 → 8.342. **0 páginas huérfanas.
0 páginas de `/pages/` sin enlace a `/states/`.** `/states/` recibe 1.076
enlaces entrantes.

### 3.5 Accesibilidad

**EVIDENCIA (Lighthouse):** `color-contrast` fallaba en 14 elementos —el oro de
marca `#C9A84C` sobre blanco da **2,29:1**, y WCAG AA exige 4,5:1— y
`link-in-text-block` en 4: los enlaces del texto editorial solo se distinguían
por color (1,1:1 frente al texto que los rodea).

**CAMBIO:** nueva variable `--gold-text #8A6F1F` (4,80:1) solo para el oro usado
como texto —el oro decorativo no se toca, la identidad visual se mantiene—;
`--muted` de `#64748b` a `#556070` (5,93:1); y subrayado de los enlaces del
contenido editorial.

**Resultado: accesibilidad 92 → 100** en las 7 páginas medidas.

---

## 4. Estado de Monetag y del service worker

**EN LA RAMA: eliminado.** Barrido de 127 archivos: `monetag`, `5gvci`,
`zoneId` y `11340585` aparecen **solo en el comentario documental** de `sw.js`;
el código ejecutable (23 líneas) está limpio. 0 `importScripts`, 0 `popunder`,
0 `window.open`, 0 `eval`, 0 `atob`, 0 `document.write`. Únicos dominios de
terceros cargados: `pagead2.googlesyndication.com` y `googleads.g.doubleclick.net`.

`sw.js` es ahora un *shim* de retirada: borra las Cache Storage del origen (el
sitio nunca usó Cache Storage propia, así que todo lo presente lo creó el worker
retirado), se desregistra y recarga las pestañas controladas. **No toca
`localStorage`, `sessionStorage`, `IndexedDB` ni cookies**, donde vive
`lcg_consent`. Sin handler de `fetch`. Retirada prevista documentada:
**12-feb-2027**. `_headers` añade `Cache-Control: no-store` en `/sw.js`.

**EN PRODUCCIÓN: sigue vivo.** `main` = `a3a8187` sirve el `sw.js` de Monetag.
Comprobado a las 13:2x del 2026-08-12: `grep -c importScripts` devuelve **1**.

Evidencia completa: `reports/monetag_removal_evidence.md`.

---

## 5. Las 52 páginas de `/pages/` (Fase 5)

`reports/pages_inventory_decisions.csv`, decisión URL por URL con GSC,
indexación, enlaces internos, texto, similitud máxima y presencia de herramienta.

| Decisión | Nº |
|---|---|
| `KEEP_AND_IMPROVE` | 21 |
| `KEEP_AS_IS` | 31 |
| `CONSOLIDATE_301` / `TEMPORARY_NOINDEX` / `REMOVE_410` | **0** |

**Ninguna eliminación, ninguna redirección, ningún noindex.** Motivos:

- 0 páginas huérfanas, 0 fuera del sitemap.
- Tras la deduplicación, el Jaccard máximo entre páginas baja de 0,861 a
  **0,656**; 0 pares por encima de 0,70.
- Texto visible mediana **8.464 caracteres**, mínimo 3.378. Ninguna es fina.
- **Pocos clics no es motivo suficiente**, y no había ninguna con evidencia
  adicional que justificase tocarla.

### Decisión explícita de NO consolidar las calculadoras

Compiten por las mismas consultas, pero son **cuatro herramientas distintas**:
`lawyer-cost` (tipo de caso, estado, horas, complejidad), `legal-fee` (tarifa,
horas, gastos, colchón), `contingency-fee` (indemnización, %, costas, orden de
deducción) y `small-claims-filing-fee` (estado, cuantía, notificación).
Consolidarlas habría destruido funcionalidad real.

---

## 6. Canibalización

82 consultas con ≥2 URLs y ≥40 impresiones, 64 con intención mixta
(`reports/final_cannibalization.csv`). El patrón —una página de Luisiana
rankeando para `business lawyer cost` y `attorney pricing`— **no era
canibalización de arquitectura: era el texto de plantilla compartido haciendo
que cualquier página encajase con cualquier consulta.**

Decisión: `NO_ACTION_ROOT_CAUSE_FIXED`. **No se consolida ni redirige ninguna
URL.** La causa se eliminó en los commits `4f451c3` y `1dbd15e`.

---

## 7. Build, pruebas, crawl y rendimiento (Fase 11)

**Build y tests: no existen en este proyecto** (HTML estático sin toolchain).
No es un fallo introducido ni preexistente.

### Crawl y validación (114 páginas)

| Comprobación | Resultado |
|---|---|
| Etiquetas balanceadas (8 tipos × 114 páginas) | ✅ 0 desbalances |
| JSON-LD válido | ✅ 291 bloques, 0 inválidos |
| Script de AdSense | ✅ máx. 1/página; ausente en 404, sitemap y políticas |
| Monetag fuera del código ejecutable | ✅ |
| Titles con cifras monetarias | ✅ 0 |
| Afirmaciones no verificables (`since 20XX`, `quarterly`) | ✅ 0 |
| FAQ compartidas en >3 páginas | ✅ 0 |
| Sitemap == páginas reales | ✅ 113 = 113 |
| Canonical absoluta, sin www, sin `.html` | ✅ 114/114 |
| `h1` único | ✅ 114/114 |
| `alt` en imágenes | ✅ 0 sin alt |
| `/pages/` enlaza a `/states/` | ✅ 0 sin enlace |
| Páginas huérfanas | ✅ 0 |
| `/pages/` Jaccard mediana | 0,238 (máx 0,656; 0 pares ≥0,70) |

### Lighthouse 12 (Chrome headless, copia servida en localhost)

| Página | Disp. | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/` | móvil | 99 | 100 | 100 | 100 | 1,4 s | 0 | 10 ms |
| `/states/ohio-lawyer-costs` | móvil | 99 | 100 | 100 | 100 | 1,7 s | 0 | 10 ms |
| `/pages/dui-lawyer-cost` | móvil | 100 | 100 | 100 | 100 | 1,2 s | 0 | 10 ms |
| `/pages/lawyer-cost-calculator` | móvil | 99 | 100 | 100 | 100 | 1,2 s | 0 | 10 ms |
| `/privacy-policy` | móvil | 100 | 100 | 100 | 100 | 1,3 s | 0 | 0 ms |
| `/` | escritorio | 94 | 100 | 100 | 100 | 0,4 s | 0 | 0 ms |
| `/states/ohio-lawyer-costs` | escritorio | 100 | 100 | 100 | 100 | 0,4 s | 0 | 0 ms |

Objetivos de la Fase 11 (LCP ≤2,5 s, CLS ≤0,1, INP ≤200 ms) **cumplidos**.

**⚠️ Son medidas de LABORATORIO sobre localhost.** No incluyen latencia de red
real ni el efecto completo de AdSense en producción. TBT es un proxy de INP, no
INP. No hay datos de campo.

---

## 8. AdSense y privacidad (Fase 10)

| Criterio | Estado |
|---|---|
| Contenido replicado | ✅ Resuelto: párrafos y FAQ. 0 bloques compartidos en >3 páginas |
| Contenido único y suficiente | ✅ `/pages/` mediana 8.464 car., mínimo 3.378; `/states/` mediana 14.816 |
| Navegación | ✅ 0 huérfanas, 0 enlaces rotos, breadcrumbs coincidentes |
| Páginas sin contenido editorial | ✅ Las calculadoras tienen 3.378–5.500 car. además de la herramienta |
| Anuncios en páginas inadecuadas | ✅ Sin AdSense en 404, sitemap ni políticas |
| Publicidad engañosa o intrusiva | ✅ 0 popups, interstitials, vignettes o redirects. Monetag fuera **en la rama** |
| Contact / About / Privacy / Terms / Disclaimer | ✅ Accesibles y enlazadas |
| `ads.txt` | ✅ `pub-3733223915347669` real, una sola línea |
| Publisher ID / Analytics | ✅ No se ha inventado ninguno |
| CLS por espacios de anuncio | ✅ CLS 0 en 6 de 7 mediciones |
| Contenido con IA presentado como revisado | ✅ Retiradas las afirmaciones de verificación trimestral y de revisión experta |
| **CMP certificada TCF** | ⚠️ **ACCIÓN MANUAL EXTERNA** |

**CMP:** Consent Mode v2 está correctamente implementado (4 señales en `denied`,
`wait_for_update: 500`, persistencia en `localStorage`), pero **Consent Mode no
es una CMP**. Para EEE/RU/Suiza Google exige una CMP certificada configurada en
**AdSense → Privacy & messaging**. **No he fabricado una CMP artesanal haciéndola
pasar por certificada.** El 96,5 % del tráfico es de EE. UU., así que el riesgo
comercial es bajo, pero el requisito existe.

**No he enviado la solicitud de revisión de AdSense.**

---

## 9. GEO / AEO (Fase 8)

Detalle en `reports/geo_readiness.md`.

Google es explícito: el SEO sigue siendo la base de la visibilidad en funciones
generativas. **Todo lo implementado se justifica por utilidad para el lector**;
que además facilite la citación es plausible, **no medido**.

Implementado: separación explícita entre dato oficial y estimación derivada
(§3.2); citas visibles junto a la afirmación, en la propia fila de la tabla;
entidades coherentes y schema reducido (§3.3); contenido principal en el DOM
inicial (HTML estático, sin render por JS); anclas descriptivas (§3.4);
accesibilidad 100; rastreo sin obstáculos.

**Descartado por falta de evidencia:** `llms.txt` (Google declara que lo
ignora), fragmentación artificial, repetición de preguntas por variante, schema
masivo, páginas nuevas por consulta *fan-out*, estadísticas sintéticas.

71 preguntas reales con ≥25 impresiones en `reports/final_geo_opportunities.csv`.
**La recomendación es responderlas dentro de la URL que ya las recibe. No se ha
creado ninguna página nueva.**

---

## 10. Fase 9 — Activo de datos: NO construido

`2026 U.S. Court Filing Fee Database` **no se ha construido**, deliberadamente.

Solo **17 de 50 estados** tienen tasas verificadas contra fuente `.gov`. Publicar
una tabla con 17 estados como si fuese una base nacional sería exactamente el
tipo de afirmación que esta auditoría ha estado retirando. El propio prompt lo
marca como secundario y prohíbe publicar una tabla incompleta como definitiva.

**Modelo de datos propuesto** (para cuando existan los 50): `state`,
`court_level`, `fee_type`, `amount`, `official_source_url`, `statute_citation`,
`effective_date`, `checked_date`, `county_variation_note`. Faltan los 33 estados
restantes y una metodología que resuelva la variación por *county*.

---

## 11. Qué NO pude verificar

1. **Producción.** La rama no está desplegada. Todo lo declarado como corregido
   lo está **en el código**, no en el sitio publicado.
2. **El shim de `sw.js` contra un navegador con el worker antiguo registrado.**
   Requeriría reproducir el registro ejecutando código de Monetag. No lo he hecho.
3. **Core Web Vitals de campo.** Solo laboratorio sobre localhost.
4. **Navegación manual buscando popups.** Sin navegador interactivo en la sesión.
   La ausencia de `window.open`/`popunder`/`document.write` es evidencia
   estática, no de comportamiento.
5. **Las tarifas de Clio contra fuente primaria.** No existe fuente pública que
   mida importes facturados. Por eso ahora son *planning estimates* declaradas.
6. **Si la CMP actual pasaría una revisión de AdSense.** Solo se sabe en consola.
7. **El motivo exacto del rechazo anterior.** No consta. La duplicación es la
   causa más probable, pero es **inferencia**.
8. **Rendimiento en funciones generativas.** Search Console no lo expone.

---

## 12. Rama, commits, diff y hash

**Rama:** `legalcostguides-adsense-seo-geo-final-2026-08-12` · **14 commits** ·
base `a3a8187` · HEAD `918d65f` · **no publicada** (sin autorización de push).

| Commit | Área |
|---|---|
| `767ad7d` | Preservar el trabajo local sin commitear del 18-jul |
| `a3b2d53` | Retirar claims no verificables; corregir ABA Model Rule 1.5 |
| `4f451c3` | Eliminar contenido plantilla en `/pages/` |
| `bc17124` | Titles/descriptions con datos propios *(revertido después por `98d1025`)* |
| `16fae05` | `lastmod` real en el sitemap |
| `8e490bb` | Informes de la primera pasada |
| `38f4d36` | Impedir que `/reports/` se sirva público |
| `eed8746` | Nota de estado en el informe |
| `1dbd15e` | **FAQ duplicadas + schema semántico** |
| `98d1025` | **Retirar rangos monetarios; etiquetar estimaciones derivadas** |
| `a655821` | **Endurecer la retirada del service worker** |
| `52d8899` | **Restaurar el enlazado `/pages/` → `/states/`** |
| `cd9965d` | **Accesibilidad 92 → 100** |
| `918d65f` | Entregables finales |

**Diff del sitio** (excluyendo `reports/`): **122 archivos, 1.312 inserciones,
1.264 eliminaciones** — 52 en `pages/`, 51 en `states/`, 8 páginas raíz,
`styles.css`, `sw.js`, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`.

**Patch verificable** (incluye `reports/`):

```
/private/tmp/claude-501/-Users-javiperezz7-Documents/88545447-785c-4d54-bd83-5a6eab944a00/scratchpad/lcg-final-2026-08-12.patch
```

- Tamaño: 9.402.116 bytes
- **SHA-256:** `064c9c3e23ecbe83b9685f0eb7f32cf8b763d9d2095b304853b0b6a3999c1c19`
- Generado con: `git diff --binary a3a8187...918d65f`

---

## 13. Métricas a observar durante 28 días

Comparar 13-ago → 09-sep contra 15-jul → 11-ago.

| Métrica | Base | Qué esperar | Alarma |
|---|---|---|---|
| **Clics de `/states/`** | 726 (3 m) | Mantener o subir | **Cualquier caída sostenida** |
| Clics totales | 407 (28 d) | ↑ (tendencia +78,5 %) | Caída >20 % |
| CTR global | 0,92 % | ↑ | Baja de 0,85 % |
| Posición media | 15,9 | Mantener o mejorar | Sube de 20 |
| CTR de los 50 estados con title nuevo | 0,91 % | La curva por posición debe inclinarse | Sin movimiento a 28 días |
| Impresiones de `/pages/` | 9.298 (3 m) | Caída temporal aceptable | Caída >50 % sostenida |
| URLs indexadas | 113 | 113 | Cualquier exclusión nueva |
| Canibalización | 64 consultas mixtas | ↓ al desaparecer la plantilla | Sube |
| `searchAppearance` | vacío | Cualquier tipo es señal real | — |
| Core Web Vitals (campo) | sin datos | Que empiece a haberlos | LCP >2,5 s |

**La métrica que manda es clics de `/states/`.** Es el 98 % del tráfico. Si cae
tras el despliegue, el cambio que les afecta son los 50 titles y descriptions;
es reversible con `git revert 98d1025`.

---

## Anexo — Entregables

| Fichero | Contenido |
|---|---|
| `FINAL_ADSENSE_SEO_GEO_AUDIT_2026-08-12.md` | Este informe |
| `MANUAL_ACTIONS_FOR_JAVI.md` | Pasos manuales, en orden, con tiempos |
| `monetag_removal_evidence.md` | Barrido completo y comprobaciones |
| `geo_readiness.md` | GEO/AEO: qué es evidencia y qué hipótesis |
| `final_gsc_raw.csv` | Volcado bruto, 4 dimensiones, 3 periodos |
| `final_gsc_query_page.csv` | 7.973 filas consulta×página con comparativa |
| `final_seo_opportunities.csv` | 100 URLs clasificadas A–F |
| `final_cannibalization.csv` | 82 consultas con decisión y motivo |
| `final_geo_opportunities.csv` | 71 preguntas reales con URL destino |
| `final_truth_source_audit.csv` | 120 claims con tipo, fuente, método y estado |
| `pages_inventory_decisions.csv` | 52 URLs con decisión y evidencia |
| `schema_semantic_audit.csv` | 291 bloques, antes/después, veredicto |
| `internal_link_graph_before_after.csv` | 114 destinos, delta de enlaces |
| `lighthouse_results.csv` | 7 mediciones móvil y escritorio |
| `legal_lead_generation_plan.md` | Plan de monetización. **Nada activado** |

`/reports/` no se sirve públicamente: `_redirects` devuelve 404 y `robots.txt`
lo excluye. Los ficheros siguen versionados en git.
