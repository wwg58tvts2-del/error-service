import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
	const appName = ref('Error Manager')
	const isLoading = ref(false)

	async function loadAppName() {
		if (isLoading.value) return
		isLoading.value = true
		try {
			const response = await fetch('/error/env', {
				headers: { Accept: 'application/json' },
			})
			const data = await response.json()
			appName.value = data.APP_NAME || 'Error Manager'
		} catch {
			appName.value = 'Error Manager'
		} finally {
			isLoading.value = false
		}
	}

	return { appName, isLoading, loadAppName }
})
