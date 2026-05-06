import { toastBus } from './toastBus'

let routerInstance = null

export function registerRouter(router) {
	routerInstance = router
}

export function goBack() {
	if (routerInstance) {
		routerInstance.back()
	} else {
		window.history.back()
	}
}

export async function copyToClipboard(value) {
	try {
		const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
		await navigator.clipboard.writeText(text)
		toastBus.emit('toast', { text: '✅ In die Zwischenablage kopiert.', type: 'success' })
	} catch {
		toastBus.emit('toast', { text: '❌ Fehler beim Kopieren.', type: 'danger' })
	}
}
