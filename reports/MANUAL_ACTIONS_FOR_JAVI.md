# Acciones manuales — Javi

**Fecha:** 2026-08-12 · **Rama lista:** `legalcostguides-adsense-seo-geo-final-2026-08-12`

Todo lo que se podía arreglar en código está arreglado y commiteado. Lo que
queda aquí **solo lo puedes hacer tú**: requiere tu autorización, tus
credenciales o una interfaz externa.

---

## BLOQUE 1 — Desplegar (obligatorio, ~15 min)

Sin esto nada de lo demás cuenta. **Producción sigue sirviendo Monetag.**

### 1.1 Revisar el diff (5 min)

```bash
cd /Users/javiperezz7/Documents/legalcostguides && git diff --stat a3a8187...legalcostguides-adsense-seo-geo-final-2026-08-12 | tail -20
```

### 1.2 Merge a `main` (2 min)

**No lo he hecho yo: requiere tu autorización explícita.**

```bash
cd /Users/javiperezz7/Documents/legalcostguides && git checkout main && git merge --no-ff legalcostguides-adsense-seo-geo-final-2026-08-12
```

### 1.3 Push → despliegue automático (1 min)

Cloudflare Pages despliega `main` al recibir el push.

```bash
cd /Users/javiperezz7/Documents/legalcostguides && git push origin main
```

### 1.4 Verificar producción (5 min) — **no te saltes esto**

```bash
curl -sS https://legalcostguides.com/sw.js | grep -c importScripts
```
→ debe devolver **0**. Si devuelve 1, el despliegue no ha entrado.

```bash
curl -sSI https://legalcostguides.com/sw.js | grep -i cache-control
```
→ debe mostrar `no-cache, no-store, must-revalidate`.

```bash
for u in / /robots.txt /ads.txt /sitemap.xml /states/ohio-lawyer-costs /pages/dui-lawyer-cost /reports/; do printf "%-34s %s\n" "$u" "$(curl -sS -o /dev/null -w '%{http_code}' https://legalcostguides.com$u)"; done
```
→ todo **200** salvo `/reports/`, que debe dar **404**.

### 1.5 Comprobar el service worker en tu navegador (2 min)

Abre `legalcostguides.com` en Chrome → `DevTools` → `Application` →
`Service Workers`. Debe quedar **vacío** tras recargar. Si aparece uno de
`5gvci.com`, pulsa `Unregister` y recarga.

---

## BLOQUE 2 — Purgar caché de Cloudflare (~3 min)

En el panel de Cloudflare, dominio `legalcostguides.com` → `Caching` →
`Configuration` → `Purge Everything`.

Necesario porque `sw.js` y `styles.css` han cambiado y pueden estar cacheados en
el borde. **No toques ninguna otra configuración de Cloudflare.**

---

## BLOQUE 3 — Search Console (~10 min, tras desplegar)

1. **Reenviar el sitemap**: Search Console → `Sitemaps` → volver a enviar
   `https://legalcostguides.com/sitemap.xml`.
2. **Solicitar indexación** solo de estas 5, no de más:
   - `/states/new-york-lawyer-costs` (posición 8,9 en una pregunta con 475 impresiones)
   - `/states/new-jersey-lawyer-costs`
   - `/states/ohio-lawyer-costs`
   - `/pages/how-much-does-a-lawyer-cost`
   - `/` (home)

   El resto se recorrerá solo. Pedir indexación masiva no acelera nada.
3. **Inspeccionar una URL** con la herramienta de inspección para confirmar que
   Google ve la versión nueva.

---

## BLOQUE 4 — CMP certificada (ACCIÓN EXTERNA, ~20 min)

**Esto no se puede resolver desde el repositorio y no he intentado fingirlo.**

El sitio implementa **Consent Mode v2** correctamente: las cuatro señales
(`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) salen
en `denied`, con `wait_for_update: 500` y persistencia en `localStorage`.

**Consent Mode no es una CMP.** Para tráfico del EEE, Reino Unido y Suiza,
Google exige una **CMP certificada compatible con TCF**, configurada dentro de
la propia cuenta de AdSense.

Ruta: **AdSense → Privacy & messaging → European regulations** → crear el
mensaje y publicarlo. Google ofrece su propia CMP certificada sin coste, que es
la opción más simple.

**Contexto para decidir la prioridad:** el 96,5 % de las impresiones y el 99 %
de los clics son de EE. UU. El riesgo comercial de no tenerla es bajo; el
requisito de política existe igualmente. Tú decides si lo haces antes o después
de solicitar la revisión.

---

## BLOQUE 5 — Solicitar la revisión de AdSense

**Todavía no. Espera 28 días desde el despliegue.**

Motivo: Google tiene que volver a rastrear 114 páginas cuyo contenido ha
cambiado sustancialmente. Solicitar la revisión con el índice todavía mostrando
la versión duplicada es desperdiciar el intento.

**Antes de solicitar, comprueba las tres cosas:**

- [ ] `curl -sS https://legalcostguides.com/sw.js | grep -c importScripts` → `0`
- [ ] En Search Console, las páginas modificadas aparecen con fecha de rastreo posterior al despliegue
- [ ] Decisión tomada sobre la CMP (bloque 4)

**No he enviado la solicitud y no debo hacerlo.**

---

## BLOQUE 6 — Lo que NO debes hacer

- No volver a instalar Monetag ni ninguna red de *popunders*, vignettes o
  interstitials. Fue lo que dejó el sitio en esta situación.
- No borrar `sw.js` antes del **12-feb-2027**: sigue desinstalando el worker
  antiguo en navegadores que lo tengan registrado.
- No reintroducir cifras monetarias en los `title` mientras el rango proceda
  solo de Clio. Si consigues una fuente primaria por estado, entonces sí.
- No crear páginas nuevas por variante de keyword.
- No activar formularios de captación de abogados: ver
  `reports/legal_lead_generation_plan.md`.
- No tocar las URLs de `/states/`: son el 98 % del tráfico.

---

## Resumen de tiempos

| Bloque | Tiempo | ¿Bloqueante? |
|---|---|---|
| 1. Desplegar y verificar | 15 min | **Sí** |
| 2. Purgar Cloudflare | 3 min | Sí |
| 3. Search Console | 10 min | No |
| 4. CMP certificada | 20 min | Para tráfico UE |
| 5. Solicitar AdSense | — | **Esperar 28 días** |

**Total de trabajo real: unos 50 minutos**, más 28 días de espera antes de
solicitar la revisión.
