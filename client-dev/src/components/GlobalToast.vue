<template>
	<div
		v-if="visible"
		class="position-fixed bottom-0 end-0 m-3"
		style="z-index: 9999">
		<div
			:class="['alert', `alert-${toast.type || 'info'}`, 'alert-dismissible', 'fade', 'show']"
			role="alert">
			{{ toast.text }}
			<button
				type="button"
				class="btn-close"
				@click="visible = false"
				aria-label="Schließen"></button>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { toastBus } from '@/lib/toastBus'

const visible = ref(false)
const toast = ref({ text: '', type: 'info' })

onMounted(() => {
	toastBus.on('toast', (msg) => {
		if (typeof msg === 'string') {
			toast.value = { text: msg, type: 'info' }
		} else {
			toast.value = { text: msg.text || '', type: msg.type || 'info' }
		}
		visible.value = true
		setTimeout(() => { visible.value = false }, 4000)
	})
})
</script>
