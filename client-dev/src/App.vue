<template>
	<GlobalToast />
	<router-view />
</template>

<script setup>
import { watch, onMounted } from 'vue'
import GlobalToast from './components/GlobalToast.vue'
import { useAppStore } from './stores/appStore'

const appStore = useAppStore()

onMounted(() => {
	appStore.loadAppName()
})

watch(
	() => appStore.appName,
	(newName) => {
		if (newName) document.title = newName
	},
	{ immediate: true }
)
</script>

<style>
body {
	font-family: Arial, sans-serif;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	min-height: 100vh;
	color: #333;
	margin: 0;
}
</style>
