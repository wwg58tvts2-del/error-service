<template>
	<nav class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark">
		<div class="container-fluid">
			<!-- Dropdown-Menü (Burger) -->
			<div class="nav-item dropdown">
				<a
					class="navbar-brand d-flex link-light"
					href="#"
					role="button"
					data-bs-toggle="dropdown"
					aria-expanded="false">
					<i class="bi bi-list" style="font-size: 1.5rem"></i>
				</a>
				<ul class="dropdown-menu">
					<li>
						<router-link class="dropdown-item" to="/">
							<i class="bi bi-exclamation-triangle me-2"></i>Fehler verwalten
						</router-link>
					</li>
					<li><hr class="dropdown-divider" /></li>
					<li v-for="service in services" :key="service.path">
						<a
							class="dropdown-item d-flex align-items-center gap-2"
							:href="service.path === '/' ? '/' : service.path">
							<img
								:src="(service.path === '/' ? '' : service.path) + '/service.svg'"
								class="service-nav-icon"
								@error="onImgError"
								alt="" />
							{{ service.name }}
						</a>
					</li>
				</ul>
			</div>

			<!-- Brand -->
			<a class="navbar-brand d-flex align-items-center gap-2 ms-2" href="#">
				<img :src="'/error/service.svg'" class="brand-icon" alt="" />
				{{ appStore.appName }}
			</a>

			<!-- Auth-User rechts -->
			<div v-if="authUser" class="ms-auto nav-item dropdown">
				<a
					href="#"
					class="d-flex align-items-center gap-2 text-white text-decoration-none dropdown-toggle"
					role="button"
					data-bs-toggle="dropdown"
					aria-expanded="false">
					<img
						v-if="authUser.picture"
						:src="authUser.picture"
						class="rounded-circle"
						width="28"
						height="28"
						:alt="authUser.display_name"
						referrerpolicy="no-referrer" />
					<i v-else class="bi bi-person-circle fs-5"></i>
					<span class="d-none d-sm-inline small">{{ authUser.display_name }}</span>
				</a>
				<ul class="dropdown-menu dropdown-menu-end">
					<li>
						<a class="dropdown-item" href="/auth/profile">
							<i class="bi bi-person-circle me-2"></i>Profil
						</a>
					</li>
					<li><hr class="dropdown-divider" /></li>
					<li>
						<button class="dropdown-item text-danger" @click="logout">
							<i class="bi bi-box-arrow-right me-2"></i>Abmelden
						</button>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()
const services = ref([])
const authUser = ref(null)

async function loadAuthUser() {
	try {
		const res = await fetch('/auth/me', { credentials: 'include' })
		if (res.ok) authUser.value = await res.json()
	} catch { /* ignore */ }
}

async function logout() {
	await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
	window.location.href = '/auth'
}

async function loadServices() {
	try {
		const result = await fetch('/hga/proxy', { headers: { Accept: 'application/json' } })
		const data = await result.json()
		services.value = data
	} catch { /* ignore */ }
}

function onImgError(e) {
	e.target.style.display = 'none'
	const fallback = document.createElement('i')
	fallback.className = 'bi bi-box'
	e.target.parentNode.insertBefore(fallback, e.target)
}

onMounted(() => {
	appStore.loadAppName()
	loadServices()
	loadAuthUser()
})
</script>

<style scoped>
.service-nav-icon {
	width: 20px;
	height: 20px;
	object-fit: contain;
}
.brand-icon {
	width: 24px;
	height: 24px;
	object-fit: contain;
}
</style>
