# Evidencia de retirada de Monetag — legalcostguides.com

**Fecha:** 2026-08-12 · **Rama:** `legalcostguides-adsense-seo-geo-final-2026-08-12`

---

## 1. Qué había exactamente (EVIDENCIA)

Tres commits del 18-jul-2026 introdujeron Monetag:

| Commit | Hora | Qué hizo |
|---|---|---|
| `637bda6` | 02:52 | Add Monetag verification service worker |
| `557a68a` | 02:59 | Add Monetag Multitag script to all pages |
| `4393f5a` | 03:02 | Revert Monetag Multitag script |
| `c527569` | 03:09 | Add Monetag Vignette Banner script to all pages |
| `a3a8187` | 03:12 | Revert Monetag Vignette Banner script |

**Los scripts inline se revirtieron. El service worker (`637bda6`) nunca se
revirtió.** Contenido de `sw.js` en `main` (commit `a3a8187`, que es lo que
Cloudflare Pages despliega):

```js
self.options = {
    "domain": "5gvci.com",
    "zoneId": 11340585
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
```

### Comprobación en producción

```
$ curl -s https://legalcostguides.com/sw.js
```

| Momento | HTTP | Coincidencias de `5gvci` |
|---|---|---|
| 2026-08-12, primera comprobación | 200 | 2 |
| 2026-08-12, comprobación posterior | 502 | — (endpoint de Monetag caído) |
| 2026-08-12, comprobación final | **200** | **2** |

**El archivo sigue servido desde el dominio en el momento de escribir esto.**
El 502 intermedio era del endpoint remoto de Monetag, no del archivo.

### Alcance real del riesgo (EVIDENCIA + INFERENCIA)

- **EVIDENCIA:** ningún HTML del repositorio registra el service worker. La
  búsqueda de `serviceWorker.register` devuelve 0 resultados en las 114 páginas
  y en `main.js`.
- **INFERENCIA:** el worker de verificación de Monetag se registra normalmente
  desde el script inline que estuvo activo entre las 02:52 y las 03:12 del
  18-jul. Cualquier navegador que visitase el sitio en esa ventana pudo
  registrarlo, y **un service worker sobrevive a la retirada del script que lo
  instaló**. No es posible saber cuántos usuarios están afectados.
- **NO VERIFICABLE:** el número de registros activos. Search Console no lo
  expone y no hay analítica que lo mida.

---

## 2. Qué se ha hecho

### 2.1 Sustitución de `sw.js`

`sw.js` pasa a ser un *shim* de retirada, no un service worker funcional:

1. `install` → `skipWaiting()`: toma el control sin esperar.
2. `activate` →
   - borra las **Cache Storage** de este origen;
   - `registration.unregister()`;
   - recarga las pestañas abiertas para que dejen de estar controladas.
3. **Sin handler de `fetch`**: no intercepta ni cachea nada.

**Por qué se borran todas las Cache Storage y no una lista concreta:**
LegalCostGuides es un sitio estático sin PWA y nunca ha usado Cache Storage por
su cuenta, así que cualquier entrada presente en este origen la creó el worker
retirado. Es un borrado acotado, no indiscriminado.

**Lo que NO se toca:** `localStorage`, `sessionStorage`, `IndexedDB` y cookies.
Ahí vive `lcg_consent`, la preferencia de consentimiento del usuario. Borrarla
le obligaría a decidir otra vez sin motivo.

**Retirada prevista:** el archivo puede eliminarse a partir del **12-feb-2027**
(6 meses desplegado). Está documentado en el propio `sw.js`.

### 2.2 Cabeceras

Añadido a `_headers` para que el navegador y Cloudflare no sirvan una copia
cacheada del `sw.js` antiguo:

```
/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Content-Type: application/javascript; charset=utf-8
```

---

## 3. Barrido completo del repositorio

127 archivos (`.html`, `.js`, `.json`, `.txt`, `.css`, `.xml`), excluyendo
`.git`, backups y `reports/`.

| Patrón | Coincidencias | Dónde |
|---|---|---|
| `monetag` | 1 | `sw.js` — **solo en el comentario** |
| `5gvci` | 1 | `sw.js` — **solo en el comentario** |
| `zoneId` | 1 | `sw.js` — **solo en el comentario** |
| `11340585` | 1 | `sw.js` — **solo en el comentario** |
| `importScripts` | 0 | — |
| `popunder` / `pop-under` | 0 | — |
| `onclick` con `window.open` | 0 | — |
| `window.open` | 0 | — |
| `eval(` | 0 | — |
| `atob(` | 0 | — |
| `document.write` | 0 | — |
| `otieu`, `profitablerate` | 0 | — |

Verificado por separado que el **código ejecutable** de `sw.js` (23 líneas, tras
eliminar comentarios) no contiene ninguno de esos términos. `node --check`
pasa en `sw.js` y `main.js`.

### Dominios de terceros cargados por el sitio

| Recurso | Veces | Dominio |
|---|---|---|
| script/link | 318 | `pagead2.googlesyndication.com` (AdSense) |
| preconnect | 212 | `googleads.g.doubleclick.net` (AdSense) |

**No hay ningún otro dominio de terceros.** Los 218 dominios restantes son
enlaces salientes en el contenido, encabezados por `clio.com`, `bls.gov`,
`uscourts.gov`, `americanbar.org` y judicaturas estatales `.gov`.

---

## 4. Lo que NO puedo declarar

- **No puedo declarar limpio el sitio en producción.** La rama corrige el
  problema, pero **no está desplegada**. `main` sigue en `a3a8187` con el
  `sw.js` de Monetag.
- **No he podido probar el shim contra un navegador que tuviera registrado el
  worker antiguo.** Requiere un navegador real que visitase el sitio en la
  ventana del 18-jul, o reproducir el registro con el script original, cosa que
  implicaría volver a ejecutar código de Monetag. No lo he hecho.
- **No he podido navegar el sitio manualmente** buscando popups o redirecciones:
  el entorno no tiene navegador disponible en esta sesión. La ausencia de
  `window.open`, `popunder` y `document.write` en el código es evidencia
  estática, no una comprobación de comportamiento.

---

## 5. Verificación obligatoria tras el despliegue

```bash
curl -sS https://legalcostguides.com/sw.js | grep -ci '5gvci\|monetag\|importScripts'
```

Debe devolver **0** en el código (las coincidencias del comentario no cuentan;
para comprobar solo el código, mirar que no aparezca `importScripts`).

```bash
curl -sSI https://legalcostguides.com/sw.js | grep -i cache-control
```

Debe mostrar `no-cache, no-store, must-revalidate`.

Y en un navegador, sobre `legalcostguides.com`:
`DevTools → Application → Service Workers` debe quedar vacío tras una recarga.
