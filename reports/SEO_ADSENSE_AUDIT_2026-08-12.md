# Auditoría SEO + AdSense — legalcostguides.com

**Fecha:** 2026-08-12 · **Rama:** `seo-adsense-recovery-2026-08-12` · **Commit base:** `a3a8187`

---

## VEREDICTO

# NO-GO — GAPS REMAIN

No por el contenido: por un archivo. **La rama `main`, que es lo que Cloudflare
Pages despliega, contiene y sirve un *service worker* de la red publicitaria
Monetag en `https://legalcostguides.com/sw.js`.** Mientras eso siga en `main`,
solicitar la revisión de AdSense es tirar el intento.

Los bloqueadores de contenido **sí** están corregidos en esta rama. Pero esta
rama no está desplegada. El veredicto pasa a GO en cuanto Javi haga *merge* a
`main` y verifique el despliegue (paso 1 de la sección "Acciones manuales").

---

## 1. Qué encontré

### 1.1 Estado inicial y stack (Fase 1)

| Elemento | Realidad verificada |
|---|---|
| Stack | HTML/CSS/JS **estático plano**. No hay generador (`generate-site.mjs`/`build_site.py`). No hay `package.json` ni build. |
| Despliegue | Cloudflare Pages con integración git en `main`. `git push` = despliegue. |
| Páginas | 114 archivos HTML (113 indexables + `404.html`) |
| Baseline de build | No procede: sin build. La verificación se hizo sobre los archivos servidos tal cual. |

**No hay generador, así que la regla "modificar siempre el generador" no aplica
aquí.** Los HTML son la fuente. Todos los cambios se han hecho de forma
programática y uniforme sobre los 114 archivos para no introducir divergencias.

### 1.2 Los tres hallazgos que importan

**① Monetag vivo en producción.** `sw.js` en `main` contiene:

```
self.options = { "domain": "5gvci.com", "zoneId": 11340585 }
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
```

Procede de los commits `637bda6`/`557a68a`/`c527569` (18-jul, 02:52–03:09). Los
scripts inline se revirtieron; **el service worker no**. Ningún HTML lo registra,
así que no está activo para los visitantes, pero el archivo se sirve desde el
dominio. Comprobado en vivo el 2026-08-12: devolvía el contenido de Monetag
(en una comprobación posterior el mismo día devolvió 502, es decir, el endpoint
de Monetag falla, pero el archivo sigue en `main`).

**② 117 archivos modificados sin commitear desde el 18-jul.** Trabajo previo
tuyo que nunca se desplegó: eliminaba el `sw.js` de Monetag, sustituía el
*byline* no verificable por enlaces a fuentes reales en 106 páginas, quitaba
secciones de relleno duplicadas y retiraba AdSense de las páginas de política y
del 404. **Estaba todo bien y llevaba tres semanas sin subir.** Lo he preservado
intacto como primer commit de la rama (`767ad7d`) sin modificar ni una línea.

**③ El contenido escalado está en `/pages/`, no en `/states/`.** Esto invierte
la hipótesis del trabajo de "de-doorway" anterior. Medición por *shingles* de 8
palabras sobre el texto de `<main>` (sin header/nav/footer/script):

| Sección | Jaccard mediana entre páginas | % de texto duplicado en la página mediana |
|---|---|---|
| `/states/` (50) | **0,041** | 25 % |
| `/pages/` (52) | **0,359** | **82 %** |

Tres secciones eran **byte-idénticas en 46 páginas**: `cost-drivers` (1.627
caracteres), `diy-vs-hire` (1.568) y `how-to-shop` (1.132). En total, 47
párrafos de ≥150 caracteres repetidos en más de 3 páginas, 1.446 instancias
duplicadas. Las tres calculadoras llegaban al 91–94 % de texto duplicado.

Search Console lo confirma: **las 52 páginas de `/pages/` suman 10 clics en 3
meses** con posición media 53,8. Google ya las había clasificado.

---

## 2. Métricas de Search Console antes de los cambios

Propiedad `sc-domain:legalcostguides.com`. Dimensión *página* (cobertura 100 %).

| Periodo | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| Desde el inicio (21-abr → 11-ago) | 773 | 99.879 | 0,77 % | 20,8 |
| 3 meses (12-may → 11-ago) | 739 | 89.860 | 0,82 % | 22,0 |
| 28 días (15-jul → 11-ago) | **407** | **44.154** | 0,92 % | **15,9** |
| 28 días previos (17-jun → 14-jul) | 228 | 26.814 | 0,85 % | 25,2 |

**Variación 28d vs 28d previos: clics +78,5 %, impresiones +64,7 %, posición
media de 25,2 a 15,9 (9,3 puestos mejor).** El sitio está creciendo con fuerza.

Por mes: abril 5 clics · mayo 59 · junio 140 · **julio 394** · agosto (11 días) 175.

Por sección (3 meses):

| Sección | Clics | Impresiones | CTR | Posición |
|---|---|---|---|---|
| `/states/` | **726** | 80.089 | 0,91 % | 18,1 |
| `/pages/` | 10 | 9.298 | 0,11 % | 53,8 |

País: **EE. UU. concentra el 96,5 % de las impresiones (81.445) y el 99 % de los
clics (720)**. El sitio ya es esencialmente estadounidense; no hay fuga de
tráfico internacional que corregir.

Dispositivo: móvil 372 clics / 45.342 impr / pos. 10,6 · escritorio 355 /
39.761 / pos. 29,5. El móvil rankea 19 puestos mejor.

Indexación: sitemap `Valid`, **113 URLs indexadas, 0 errores, 0 advertencias**
(última descarga 2026-08-06).

### ⚠️ Limitación metodológica que condiciona todo el análisis de consultas

**La dimensión *consulta* de Search Console sólo cubre el 34,3 % de las
impresiones y el 3,9 % de los clics de este sitio** (28.913 de 84.389
impresiones; 28 de 727 clics). El resto son consultas anonimizadas de cola
larga. La consulta con más clics en 3 meses tiene **4 clics**.

Consecuencias, y las asumo explícitamente:

- **No se puede construir una curva de CTR esperado por consulta.** Sólo 147
  filas consulta×página superan las 30 impresiones y casi todas están en
  posición 26+ con 0 clics. Cualquier "CTR esperado" a nivel de consulta sería
  inventado. **No lo he hecho.**
- El análisis de oportunidad se ha hecho **a nivel de página**, donde la
  cobertura es del 100 %, usando como referencia el **CTR mediano observado del
  propio sitio por banda de posición** — no un *benchmark* externo.
- La canibalización se mide sobre ese 34 % y se declara como tal.

**Baseline propio de CTR por banda** (páginas con ≥300 impresiones en 3 meses):

| Posición | n | CTR mediano | CTR máximo |
|---|---|---|---|
| 6–10 | 12 | 1,23 % | 1,93 % |
| 11–15 | 19 | 1,09 % | 1,42 % |
| 16–20 | 7 | 0,98 % | 2,09 % |
| 21–25 | 5 | 0,66 % | 0,78 % |
| 26+ | 14 | 0,19 % | 0,75 % |

**La curva es casi plana entre las posiciones 6 y 20.** Una página en posición
7 rinde prácticamente igual que una en posición 19. Eso no es normal: apunta a
que el sitio aparece para consultas cuya intención no termina de satisfacer, no
sólo a que rankee bajo. Es el diagnóstico central de este informe y la razón
por la que el trabajo de *title/description* se ha priorizado sobre el de
posiciones.

---

## 3. Las 20 oportunidades priorizadas

Ordenadas por clics adicionales estimados a 3 meses si la página alcanzase el
CTR mediano de su propia banda de posición. Clasificación: **A** winner ·
**B** oportunidad CTR · **C** *striking distance* · **E** *decay* · **F** poca
evidencia. Fichero completo: `reports/gsc_opportunities.csv` (100 URLs).

| # | Página | Clase | Clics 3m | Impr 3m | CTR | Pos | Δclics 28d | +clics est. |
|---|---|---|---|---|---|---|---|---|
| 1 | `/states/connecticut-lawyer-costs` | BC | 9 | 1.590 | 0,57 % | 10,9 | +66,7 % | 10,5 |
| 2 | `/states/pennsylvania-lawyer-costs` | BC | 6 | 1.299 | 0,46 % | 12,0 | −66,7 % | 8,1 |
| 3 | `/states/missouri-lawyer-costs` | BC | 15 | 2.121 | 0,71 % | 13,6 | +133,3 % | 8,0 |
| 4 | `/states/south-dakota-lawyer-costs` | ABC | 13 | 1.562 | 0,83 % | 8,6 | +125,0 % | 6,2 |
| 5 | `/states/arkansas-lawyer-costs` | BCE | 11 | 1.389 | 0,79 % | 9,3 | −33,3 % | 6,1 |
| 6 | `/states/ohio-lawyer-costs` | C | 3 | 891 | 0,34 % | 17,4 | — | 5,7 |
| 7 | `/states/kentucky-lawyer-costs` | AC | 24 | 2.730 | 0,88 % | 11,5 | 0,0 % | 5,6 |
| 8 | `/states/maryland-lawyer-costs` | AC | 17 | 2.254 | 0,75 % | 19,1 | +266,7 % | 5,1 |
| 9 | `/states/michigan-lawyer-costs` | BC | 6 | 866 | 0,69 % | 14,7 | −33,3 % | 3,4 |
| 10 | `/pages/business-lawyer-cost` | F | 0 | 1.426 | 0,00 % | 58,5 | — | 2,7 |
| 11 | `/states/kansas-lawyer-costs` | AC | 14 | 1.362 | 1,03 % | 9,6 | +1.100 % | 2,7 |
| 12 | `/pages/lawyer-consultation-fee` | F | 0 | 1.321 | 0,00 % | 58,1 | — | 2,5 |
| 13 | `/states/rhode-island-lawyer-costs` | C | 8 | 827 | 0,97 % | 9,4 | −33,3 % | 2,2 |
| 14 | `/states/west-virginia-lawyer-costs` | C | 14 | 1.480 | 0,95 % | 14,1 | +40,0 % | 2,1 |
| 15 | `/states/georgia-lawyer-costs` | C | 3 | 511 | 0,59 % | 19,0 | — | 2,0 |
| 16 | `/states/north-carolina-lawyer-costs` | C | 4 | 897 | 0,45 % | 24,5 | 0,0 % | 1,9 |
| 17 | `/pages/criminal-defense-lawyer-cost` | F | 0 | 928 | 0,00 % | 59,3 | — | 1,7 |
| 18 | `/states/arizona-lawyer-costs` | AC | 17 | 1.709 | 0,99 % | 11,8 | +33,3 % | 1,6 |
| 19 | `/pages/dui-lawyer-cost` | F | 0 | 531 | 0,00 % | 56,2 | — | 1,0 |
| 20 | `/states/virginia-lawyer-costs` | A | 13 | 2.114 | 0,61 % | 26,0 | +125,0 % | 0,9 |

**Winners a proteger (26 URLs, clase A):** Massachusetts (35 clics), New Jersey
(30), Minnesota (27), Kentucky (24), Iowa, Nevada, Maine, Kansas, Maryland,
Arizona, South Dakota, West Virginia, Virginia y el resto de páginas de estado.
**Ninguna de sus URLs se ha tocado.**

**Decay (3 URLs):** `/pages/how-much-does-a-lawyer-cost` (impresiones 339→184,
−45,7 %), `/states/arkansas-lawyer-costs` (clics 6→4, pero impresiones +85,5 %)
y `/states/wyoming-lawyer-costs` (clics 5→3, impresiones +88,3 %). **En dos de
los tres el volumen sube y sólo caen los clics: no es decay, es la caída de CTR
por ganar impresiones en posiciones peores.** No se ha actuado sobre ellas.

---

## 4. Canibalización (Fase 2-D)

82 consultas con ≥2 URLs y ≥40 impresiones; **64 con intención mixta**
(`/states/` compitiendo con `/pages/`). Fichero: `reports/gsc_cannibalization.csv`.

El patrón es revelador y refuerza el hallazgo ③:

| Consulta | URL 1 | URL 2 |
|---|---|---|
| `business lawyer cost` | `/pages/business-lawyer-cost` (237, pos 62,3) | `/states/louisiana-lawyer-costs` (173, pos 59,7) |
| `attorney pricing` | `/states/louisiana-lawyer-costs` (254, pos 31,7) | `/states/south-carolina-lawyer-costs` (76) |
| `legal fees` | `/states/louisiana-lawyer-costs` (289, pos 45,7) | `/pages/legal-fee-calculator` (109) |
| `lawyer pricing` | `/states/louisiana-lawyer-costs` (208, pos 31,9) | `/pages/how-much-does-a-lawyer-cost` (48) |

**Una página de Luisiana rankeando para `business lawyer cost` y `attorney
pricing` no es canibalización geográfica: es la prueba de que el texto genérico
compartido hacía que cualquier página encajase con cualquier consulta.**
Al eliminar la plantilla compartida (§5.2), la causa desaparece. No se ha
consolidado ni redirigido ninguna URL por este motivo: el diagnóstico correcto
era de contenido, no de arquitectura.

### Decisión explícita de NO consolidar las calculadoras

`legal-fee-calculator` y `lawyer-cost-calculator` compiten por las mismas
consultas (`attorney fee calculator`, `lawyer fee calculator`). La consolidación
parecía indicada **hasta inspeccionar las herramientas**:

| Calculadora | Campos |
|---|---|
| `lawyer-cost-calculator` | tipo de caso, estado, horas, complejidad |
| `legal-fee-calculator` | tarifa/hora, horas, gastos, colchón |
| `contingency-fee-calculator` | indemnización, %, costas, orden de deducción |
| `small-claims-filing-fee-calculator` | estado, cuantía, notificación |

**Son cuatro herramientas distintas con entradas y cálculo propios.**
Consolidarlas habría destruido funcionalidad real. Se diferencian por texto y
metadatos, no se fusionan.

---

## 5. Qué cambié

5 commits en `seo-adsense-recovery-2026-08-12`. 122 archivos frente a `main`.

### 5.1 `767ad7d` — Preservar el trabajo sin commitear (baseline)

Snapshot literal de los 117 archivos modificados del 18-jul, **sin tocar nada**.
Incluye la eliminación del `sw.js` de Monetag, el *byline* con fuentes reales en
106 páginas y la retirada de AdSense de `404`, `contact`, `disclaimer`,
`editorial-policy`, `how-we-research`, `privacy-policy`, `sitemap` y `terms`.

### 5.2 `4f451c3` — Eliminar el contenido plantilla de `/pages/`

- Las 3 secciones idénticas se conservan **sólo** en el hub
  `/pages/how-much-does-a-lawyer-cost` y se retiran de las otras 45.
- Se eliminan los 41 párrafos de prosa compartida dentro de `quick-answer`,
  `billing-models`, `city-tier-pricing`, `state-comparison` y
  `sources-and-methodology`.
- **Se conservan íntegros los títulos, las tablas y las FAQ de cada página. No
  se ha borrado ni un dato propio.**
- Cada página enlaza al hub mediante una sección breve `shared-cost-basics`.

| Métrica | Antes | Después |
|---|---|---|
| % de texto duplicado en la página mediana | 82 % | **0 %** |
| Párrafos compartidos en >3 páginas | 47 | **0** |
| Jaccard mediana `/pages/` | 0,359 | **0,205** |
| Pares con Jaccard ≥0,70 | 186 | **0** |
| Texto visible en `<main>` | mediana 11.224 car. | mediana 8.018 car., mínimo 3.470 |

Ninguna página baja de 3.000 caracteres visibles. Las tablas siguen ahí.

### 5.3 `a3b2d53` — Veracidad y E-E-A-T

Detalle completo en `reports/truth_and_source_audit.csv` (66 filas: 12
corregidas, 20 verificadas, 34 no verificables).

| Afirmación retirada | Por qué |
|---|---|
| "researching U.S. legal costs **since 2022**" (texto y JSON-LD) | La primera impresión del dominio en GSC es del **2026-04-21**. Sin evidencia. |
| "Every guide is **verified quarterly** against current official data" | El sitio tiene ~4 meses. Un ciclo trimestral no puede haberse demostrado. |
| "Review cadence: **Quarterly**" (ficha de autor, about, editorial-policy ×3, how-we-research, home) | Igual. 10 menciones eliminadas en 5 páginas. |
| "33 % a 40 % … **(ABA Model Rule 1.5)**" en personal-injury y mesothelioma | **La Model Rule 1.5 no publica porcentajes.** Exige que el honorario sea razonable y que la cuota litis conste por escrito. |
| Model Rule 1.5 listada como fuente de *benchmarks* en la home | Misma razón. Se explicita para qué sirve realmente. |

**Se mantienen** por ser verificables: "Javi is not an attorney, not a licensed
paralegal, and not affiliated with any law firm" y la declaración de ausencia de
relaciones comerciales — comprobado: **0 enlaces de afiliado, 0 formularios de
lead, 0 `rel="sponsored"` en las 114 páginas**.

### 5.4 `bc17124` — Title y description con datos propios

10 estados compartían una *description* genérica idéntica salvo el nombre y 6 de
ellos un H1 corto también genérico: CA, FL, GA, IL, MI, NY, NC, OH, PA, TX.
Coinciden con el único clúster de similitud alta dentro de `/states/`
(FL-GA-IL-MI-OH-PA-TX, Jaccard ≈0,72) y con las peores posiciones del directorio.

Reescritos con **las cifras reales de cada página**: mínimo y máximo de la
columna *Typical rate band* de su tabla de metros y el *Average lawyer-rate
benchmark* de su tabla resumen.

> `Ohio Lawyer Costs 2026: $199-$317/hr by Metro`
> `Ohio lawyer rates in 2026: $199-$317/hr by metro vs a $276 statewide benchmark. Retainers, flat fees and contingency explained.`

**Nota de proceso:** el primer intento de extracción mezcló la tabla de metros
con la de áreas de práctica y produjo rangos falsos (Texas $204–$555 en vez de
$290–$463). Se detectó al verificar contra la fuente, se revirtieron los 10
archivos y se rehízo parseando sólo la tabla correcta. **Toda cifra de un title
o una description existe literalmente en el `<main>` de su propia página,
comprobado programáticamente (10/10).**

También: 12 *titles* que superaban 60 caracteres pierden el sufijo de marca.

### 5.5 `16fae05` — Sitemap

`lastmod` con la fecha real de última modificación de cada archivo.

---

## 6. Auditoría técnica (Fase 3) y validación (Fase 9)

Todo comprobado sobre los 114 archivos y, donde procede, en vivo.

| Comprobación | Resultado |
|---|---|
| HTTP → HTTPS | ✅ 301 a `https://legalcostguides.com/` |
| www → sin www | ✅ 301 |
| `/index.html` → `/` | ⚠️ **308**, no 301. Cloudflare normaliza antes de `_redirects`. Permanente igualmente; sin impacto SEO. |
| Canonicals | ✅ 113/113 correctas. 0 con www, 0 con `.html`, 0 ausentes |
| `robots.txt` | ✅ `Disallow /*?q=*` y `/*?s=*`, sitemap declarado, Googlebot no bloqueado |
| `ads.txt` | ✅ `pub-3733223915347669` real, accesible, una sola línea |
| Sitemap vs páginas reales | ✅ **113 = 113**. 0 sobrantes, 0 faltantes, 0 duplicadas, ninguna con `.html` ni www |
| Sitemap XML | ✅ válido, 113 `<loc>`, 113 `<lastmod>` |
| Scripts de AdSense | ✅ **máximo 1 por página**, 0 duplicados, ausente en las 8 páginas de política/404/sitemap |
| Monetag | ✅ **0 rastros** en la rama (114 HTML + `sw.js` + `main.js`) |
| JSON-LD | ✅ **340 bloques, 0 inválidos**. Todos estáticos en `<head>`, ninguno inyectado por JS |
| H1 | ✅ exactamente 1 por página, 114/114 |
| Imágenes | ✅ 0 sin `alt`, 0 con `alt` vacío |
| Enlaces internos | ✅ 118 destinos, **0 rotos** |
| Páginas huérfanas | ✅ **0** |
| `noindex` | ✅ sólo `404.html` |
| Etiquetas balanceadas | ✅ 0 desbalances en 6 etiquetas × 114 archivos |
| Afirmaciones no verificables | ✅ 0 páginas con `since 20XX` o `quarterly` |
| Consent Mode v2 | ✅ presente, `denied` por defecto en las 4 señales |

**No pude medir:** LCP, CLS, INP ni Lighthouse. No hay Chrome headless ni
`lighthouse` disponibles en este entorno y el sitio no está desplegado con los
cambios. Queda como acción manual.

---

## 7. AdSense readiness (Fase 7)

| Criterio | Estado |
|---|---|
| Contenido replicado | ✅ **Resuelto.** Era el bloqueador principal: 82 % → 0 % de texto duplicado en `/pages/` |
| Contenido único y relevante | ✅ 113 páginas, mediana 8.018 car. en `/pages/` y 14.803 en `/states/`. Ninguna vacía |
| Navegación | ✅ 0 huérfanas, 0 enlaces rotos, breadcrumbs en todas |
| Páginas sin contenido editorial | ✅ Las 4 calculadoras tienen contexto: 3.470–5.520 caracteres además de la herramienta |
| Anuncios en páginas inadecuadas | ✅ Sin AdSense en 404, sitemap ni páginas de política |
| Publicidad engañosa / intrusiva | ✅ Sin popups, interstitials ni vignettes. Monetag eliminado **en la rama** |
| Privacidad y consentimiento | ⚠️ Consent Mode v2 correcto, pero **no hay CMP certificada TCF v2.3** |
| Políticas de editores | ✅ Sin credenciales inventadas, sin testimonios, sin teléfonos falsos, sin superlativos sobre despachos |
| Contenido generado con IA presentado como revisado | ✅ Corregido: retiradas las afirmaciones de verificación trimestral y de revisión experta |

### El bloqueador que queda

**Monetag sigue en `main`.** Todo lo anterior está en la rama, no desplegado.

### CMP — acción manual externa

El banner actual implementa Consent Mode v2 correctamente (todas las señales
en `denied` por defecto, `wait_for_update: 500`, persistencia en
`localStorage`), pero **no es una CMP certificada por Google compatible con
TCF v2.3**. Para tráfico del EEE/Reino Unido, AdSense exige una CMP certificada
configurada en **Privacy & Messaging** dentro de la propia cuenta de AdSense.

**No he fabricado una CMP falsa desde el código.** Con el 96,5 % del tráfico en
EE. UU. el riesgo comercial es bajo, pero el requisito de política existe. Se
resuelve en la interfaz de AdSense, no en el repositorio.

---

## 8. Qué no pude verificar

1. **Las bandas de tarifa por metro y el benchmark estatal de los 33 estados no
   verificados.** Proceden de *Clio Lawyer Rates by State* y BLS OES. Clio es
   una fuente comercial secundaria que no publica un desglose por metro
   auditable. **Las cifras que he puesto en los nuevos titles son fielmente las
   que ya estaban en cada página, pero no he podido validar el dato de origen
   contra fuente primaria.** 17 estados sí tienen tasas judiciales verificadas
   contra `.gov` (commit `cd65206`); los otros 33, no.
2. **Core Web Vitals, LCP, CLS, INP y Lighthouse.** Sin herramientas en el entorno.
3. **Si la CMP actual pasaría una revisión de AdSense.** Sólo se sabe en la propia consola.
4. **El motivo exacto del rechazo anterior de AdSense.** No consta en el repositorio.
   El contenido duplicado al 82 % es la causa más probable, pero es **inferencia**,
   no evidencia.
5. **El comportamiento real del CTR tras los cambios de title.** Necesita 28 días.
6. **El volumen real de intención comercial**, por la anonimización del 96 % de
   los clics en la dimensión consulta.

---

## 9. Acciones manuales para Javi

### Ahora, por orden

1. **Revisar y hacer merge de la rama a `main`.** Es lo único que elimina
   Monetag de producción. Sin esto, nada de lo demás cuenta.
   ```bash
   cd /Users/javiperezz7/Documents/legalcostguides && git diff main..seo-adsense-recovery-2026-08-12 --stat
   ```
2. **Verificar el despliegue** en cuanto Cloudflare Pages publique:
   ```bash
   curl -sI https://legalcostguides.com/sw.js | head -1 && curl -s https://legalcostguides.com/sw.js | head -3
   ```
   Debe devolver el service worker de auto-desregistro, **no** `5gvci.com`.
3. **No solicitar AdSense hasta confirmar el paso 2.**

### Después del despliegue

4. Reenviar el sitemap en Search Console y solicitar reindexación de
   `/pages/how-much-does-a-lawyer-cost` y de los 10 estados con title nuevo.
5. Ejecutar PageSpeed Insights sobre la home y una página de estado para
   obtener LCP/CLS/INP reales.
6. Decidir sobre la CMP en AdSense → Privacy & Messaging.
7. Esperar 28 días antes de solicitar la revisión de AdSense, para que Google
   recorra el contenido deduplicado.

### Lo que NO debes hacer

- No volver a tocar Monetag ni ninguna red de *popunders*.
- No crear páginas nuevas por variante de keyword.
- No reintroducir texto de relleno compartido entre páginas.
- No activar generación de leads: ver `reports/legal_lead_generation_plan.md`.

---

## 10. Métricas a revisar en Search Console en los próximos 28 días

Comparar 12-ago → 08-sep contra 15-jul → 11-ago.

| Métrica | Base (28d) | Qué esperar | Señal de alarma |
|---|---|---|---|
| CTR global | 0,92 % | ↑ hacia 1,1–1,3 % | Baja de 0,85 % |
| CTR de los 10 estados con title nuevo | 0,34–0,71 % | ↑ hacia la mediana de su banda | Sin movimiento a los 28 días |
| Posición media | 15,9 | Mantener o mejorar | Sube por encima de 20 |
| Clics totales | 407 | ↑ (tendencia +78,5 %) | Caída >20 % |
| Impresiones de `/pages/` | 9.298 (3m) | Caída temporal aceptable | Caída >50 % sostenida |
| Clics de `/states/` | 726 (3m) | **No debe bajar** | Cualquier caída sostenida |
| URLs indexadas | 113 | 113 | Cualquier exclusión nueva |

**La métrica que más importa: los clics de `/states/`.** Son el 98 % del
tráfico. Si caen tras el despliegue, revisar primero los 10 estados con title
nuevo — son el único cambio que les afecta y es trivialmente reversible con
`git revert bc17124`.

---

## Anexo — Ficheros entregados

| Fichero | Contenido |
|---|---|
| `reports/SEO_ADSENSE_AUDIT_2026-08-12.md` | Este informe |
| `reports/gsc_raw_export.csv` | 16.405 filas consulta×página, los 3 periodos |
| `reports/gsc_query_page_matrix.csv` | 7.973 filas con comparativa entre periodos |
| `reports/gsc_opportunities.csv` | 100 URLs clasificadas A–F con clics estimados |
| `reports/gsc_cannibalization.csv` | 82 consultas con ≥2 URLs |
| `reports/truth_and_source_audit.csv` | 66 afirmaciones: 12 corregidas, 20 verificadas, 34 no verificables |
| `reports/legal_lead_generation_plan.md` | Plan de monetización. **Nada activado** |

**Aviso:** Cloudflare Pages despliega todo el repositorio, así que estos
informes habrían quedado accesibles en `legalcostguides.com/reports/`. Commit
`38f4d36` lo impide: `_redirects` devuelve 404 para `/reports/*` (sin usar
reglas 200) y `robots.txt` añade `Disallow: /reports/`. Los ficheros siguen
versionados en git.

**La rama no se ha subido.** Queda en local a la espera de tu confirmación.
