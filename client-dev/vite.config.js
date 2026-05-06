import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '../', '')
	return {
		plugins: [vue()],
		base: '/error/app',
		build: {
			outDir: '../dist',
			emptyOutDir: true,
		},
		server: {
			port: 5177,
			proxy: {
				'/error': {
					target: 'http://localhost:8087',
					changeOrigin: true,
				},
				'/hga': {
					target: 'http://localhost:8080',
					changeOrigin: true,
				},
				'/auth': {
					target: 'http://localhost:8080',
					changeOrigin: true,
				},
			},
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		define: {
			__APP_NAME__: JSON.stringify(env.APP_NAME || 'Error Manager'),
		},
	}
})
