# Plan de monetización con abogados — legalcostguides.com

**Fecha:** 2026-08-12 · **Estado: PLAN. No se ha activado nada.**

No se ha publicado ningún formulario, ningún listado de despachos, ningún CTA de
contacto con abogados ni ningún dato de profesional. No existe proveedor ni
contrato. Este documento es únicamente el diseño de la vía futura.

---

## 1. Veredicto sobre el momento: TODAVÍA NO

**Recomendación: no construir generación de leads en los próximos 3–6 meses.**
La razón no es regulatoria en primera instancia, es de evidencia: el tráfico
actual no contiene volumen apreciable de intención de contratar abogado.

### Evidencia (Search Console, 12-may → 11-ago 2026)

| Métrica | Valor |
|---|---|
| Impresiones con intención de *buscar abogado*<sup>1</sup> | **790** |
| Clics de esas consultas | **2** |
| Peso sobre la matriz consulta×página | 2,7 % de 28.913 impresiones |
| Posición media de esas consultas | mayoritariamente 32–55 |

<sup>1</sup> Filtro sobre la matriz consulta×página: `near me`, `lawyers/attorneys in`,
`find a lawyer`, `best lawyer`, `hire a`, `free consultation`. 342 filas.

Las únicas consultas de esa familia en posición decente son
`lawyers near me` (pos. 2,8) y `attorneys in jackson mississippi` (pos. 3),
con 14 y 10 impresiones y **0 clics**. No hay negocio ahí todavía.

**Advertencia metodológica:** la dimensión *consulta* de Search Console sólo
cubre el 34,3 % de las impresiones y el 3,9 % de los clics de este sitio (el
resto son consultas anonimizadas de cola larga). El volumen real de intención
comercial podría ser algo mayor, pero no puede medirse con los datos
disponibles. No se debe construir un negocio sobre esa incertidumbre.

---

## 2. Si en el futuro la evidencia lo justifica

### 2.1 Especialidad inicial recomendada

| Área | Impresiones 3 m | Clics | Comentario |
|---|---|---|---|
| **Criminal / DUI** | 2.435 | 5 | Mayor volumen observado |
| Mercantil | 1.762 | 0 | Volumen alto, 0 conversión, posición ~58 |
| Divorcio / familia | 1.758 | 2 | Intención de coste muy clara |
| Inmobiliario / testamentos | 1.262 | 1 | |
| Laboral | 824 | 0 | |
| Lesiones personales | 792 | 2 | El más rentable del sector, el más competido |

**Elección: divorcio / familia, no criminal.** Aunque criminal/DUI tiene más
impresiones, es la categoría de mayor riesgo: el usuario está en una situación
de urgencia y vulnerabilidad, la publicidad de defensa penal está más vigilada
por los colegios estatales, y el margen de error reputacional es mínimo.
Divorcio/familia tiene volumen equivalente, intención de presupuesto explícita
y un perfil de riesgo sensiblemente menor.

### 2.2 Estados iniciales

Criterio: estados donde el sitio ya rankea **y** con datos judiciales propios ya
verificados contra fuente .gov.

| Estado | Clics 3 m | Pos. media | Datos .gov verificados |
|---|---|---|---|
| **New Jersey** | 30 | 11,5 | Sí (njcourts.gov) |
| **Massachusetts** | 35 | 12,7 | No |
| **Minnesota** | 27 | 12,0 | Sí (mncourts.gov) |
| Kentucky | 24 | 11,5 | Sí (kycourts.gov) |

Arrancar con **New Jersey y Minnesota**: son los dos únicos que combinan
rendimiento real, posición media por debajo de 12 y tasas judiciales ya
verificadas contra la judicatura del estado. New Jersey además ya recibe
consultas geolocalizadas concretas (`divorce lawyers in nj cost`, 45 impresiones).

### 2.3 Páginas donde tendría sentido un CTA

Sólo en las páginas de estado, nunca en las guías genéricas ni en las
calculadoras. Y sólo debajo del contenido de coste, nunca por encima.

- `/states/new-jersey-lawyer-costs`
- `/states/minnesota-lawyer-costs`

### 2.4 Modelo por orden de preferencia

1. **Listado patrocinado con tarifa plana y divulgación visible.** El despacho
   paga por aparecer, no por lead. No hay perfilado del usuario ni transferencia
   de datos personales. Es el modelo de menor riesgo regulatorio y el único
   compatible con no tener entidad en EE. UU.
2. **Publicidad display segmentada** (ya cubierta por AdSense).
3. **Generación de lead con formulario.** Descartado en fase inicial: implica
   tratar datos personales de residentes de EE. UU. (CCPA/CPRA y equivalentes),
   contrato con cada despacho, y expone a las normas estatales sobre reparto de
   honorarios y recomendación de profesionales.

---

## 3. Riesgo regulatorio (resumen, no es asesoramiento jurídico)

- **ABA Model Rules 7.1–7.3** y su transposición estatal regulan la publicidad
  legal, la compensación por recomendación y el contacto con clientes
  potenciales. Varían de forma sustancial entre estados.
- Un sitio que cobra por dirigir usuarios a un abogado puede quedar sujeto a
  reglas sobre *referral services* según el estado. Requiere revisión legal
  estatal antes de activar nada.
- **Sin entidad en EE. UU.**, la contratación con despachos y el tratamiento de
  datos de consumidores estadounidenses añade fricción fiscal y de privacidad.
- **FTC**: toda compensación debe divulgarse de forma clara y visible, no en
  letra pequeña ni sólo en la política de privacidad.

**Acción obligatoria antes de activar:** revisión por un abogado colegiado en
cada estado de destino. No es opcional y no puede sustituirse por
autodocumentación.

---

## 4. Texto de divulgación obligatorio en la futura interfaz

Debe aparecer en la propia página, visible sin desplegar nada, no sólo en los
términos:

> LegalCostGuides no es un bufete de abogados y no presta servicios jurídicos.
> El uso de este sitio no crea una relación abogado-cliente. Los profesionales
> que aparecen son independientes y no han sido evaluados por nosotros en cuanto
> a la calidad de su trabajo ni a la idoneidad para su caso. Los resultados
> patrocinados están pagados y no son recomendaciones editoriales. Las normas
> sobre honorarios y publicidad legal varían según el estado.

**Prohibiciones permanentes:** no llamar a ningún despacho "el mejor",
"recomendado", "seleccionado" ni "verificado"; no ordenar por calidad aparente;
no dar a entender que se ha analizado el problema jurídico del visitante; no
mostrar reseñas ni valoraciones que no procedan de una fuente auditable.

---

## 5. Métricas que deben cumplirse antes de invertir

Revisar en Search Console dentro de 90 días. Activar sólo si se cumplen **las
tres**:

| Condición | Umbral | Valor hoy |
|---|---|---|
| Impresiones/mes con intención de buscar abogado | ≥ 3.000 | ~265 |
| Clics/mes de esas consultas | ≥ 60 | < 1 |
| Posición media de esas consultas | ≤ 15 | 32–55 |

Si a los 90 días no se cumplen, la prioridad sigue siendo AdSense y crecimiento
de contenido, no monetización con abogados.
