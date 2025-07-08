

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": false,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.DTTOD2Sh.js","_app/immutable/chunks/DmYNFpl8.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/CeLujRwG.js","_app/immutable/chunks/D3D0szQ9.js","_app/immutable/chunks/Br4C82LX.js","_app/immutable/chunks/D7Y5bg0-.js","_app/immutable/chunks/2hV1sW95.js"];
export const stylesheets = ["_app/immutable/assets/NavigationBar.fpz3t88i.css","_app/immutable/assets/0.BYzHFT8J.css"];
export const fonts = [];
