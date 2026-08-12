/*
 * Retirada del service worker heredado de Monetag.
 *
 * Contexto: entre el 18-jul-2026 02:52 y 03:09 se subio a /sw.js un service
 * worker de la red publicitaria Monetag (dominio 5gvci.com, zoneId 11340585).
 * Los scripts inline se revirtieron, este archivo no. Cualquier navegador que
 * visitase el sitio en ese intervalo pudo registrar aquel worker y seguiria
 * teniendolo instalado, ya que un service worker sobrevive a la navegacion.
 *
 * Este archivo NO es un service worker funcional: existe solo para que los
 * navegadores con el worker antiguo instalado lo sustituyan por este y este,
 * a su vez, se desinstale. LegalCostGuides es un sitio estatico sin PWA y no
 * necesita ningun service worker.
 *
 * Alcance de la limpieza: se borran unicamente las Cache Storage de este
 * origen. El sitio nunca ha usado Cache Storage por su cuenta, asi que
 * cualquier entrada presente la creo el worker retirado. NO se toca
 * localStorage, sessionStorage, IndexedDB ni cookies: ahi vive la preferencia
 * de consentimiento del usuario (lcg_consent) y borrarla le obligaria a
 * decidir otra vez sin motivo.
 *
 * RETIRADA PREVISTA: este archivo puede eliminarse a partir del 12-feb-2027
 * (6 meses de despliegue), cuando sea razonable dar por reinstalados o
 * caducados los registros antiguos. Al borrarlo, /sw.js debe devolver 404.
 */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1. Borrar las Cache Storage dejadas por el worker retirado.
    if (self.caches && typeof caches.keys === 'function') {
      try {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      } catch (e) {
        // Si el borrado falla no se aborta: desregistrar es lo prioritario.
      }
    }

    // 2. Desregistrar este worker. A partir de aqui el origen queda sin SW.
    try {
      await self.registration.unregister();
    } catch (e) {
      // ignorado a proposito
    }

    // 3. Recargar las pestanas abiertas para que dejen de estar controladas
    //    por el worker antiguo sin esperar a que el usuario navegue.
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        if ('navigate' in client) await client.navigate(client.url);
      }
    } catch (e) {
      // ignorado a proposito
    }
  })());
});

// Sin handler de 'fetch': este worker no intercepta ni cachea ninguna peticion.
