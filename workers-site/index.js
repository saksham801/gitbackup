import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event)
  } catch (error) {
    return await getAssetFromKV(event, {
      mapRequestToAsset: (request) => {
        const url = new URL(request.url)
        return new Request(`${url.origin}/index.html`, request)
      },
    })
  }
}
