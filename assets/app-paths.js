// Resolve internal resources from the module's app directory, including project Pages URLs.
const moduleBase = new URL('../', import.meta.url);
export function appURL(path = '') {
  const origin = globalThis.location?.origin;
  const base = moduleBase.protocol === 'file:' && origin && /^https?:\/\//.test(origin)
    ? new URL('/', origin) : moduleBase;
  return new URL(String(path).replace(/^\/+/, ''), base).href;
}
