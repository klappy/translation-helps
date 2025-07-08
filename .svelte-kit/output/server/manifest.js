export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["_redirects"]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.CTfTJfAL.js",app:"_app/immutable/entry/app.DRzuJ_e2.js",imports:["_app/immutable/entry/start.CTfTJfAL.js","_app/immutable/chunks/CeLujRwG.js","_app/immutable/chunks/DmYNFpl8.js","_app/immutable/chunks/D3D0szQ9.js","_app/immutable/entry/app.DRzuJ_e2.js","_app/immutable/chunks/DmYNFpl8.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/showcase",
				pattern: /^\/showcase\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/showcase/[section]",
				pattern: /^\/showcase\/([^/]+?)\/?$/,
				params: [{"name":"section","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
