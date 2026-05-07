<template>
	<div class="container-fluid p-0">
		<Navbar />
		<ErrorListSidebar v-model:viewMode="viewMode" />
		<main class="container-fluid" style="padding-right: 68px">
			<div class="row justify-content-center pt-5">
				<div class="col-12 col-xl-11 col-xxl-10">

					<!-- Header Card -->
					<div class="card shadow-sm mb-4">
						<div class="card-header d-flex justify-content-between align-items-center bg-white border-0 pb-0">
							<h5 class="mb-0">
								<i class="bi bi-exclamation-triangle me-2 text-warning"></i>
								Fehlerseiten verwalten
							</h5>
							<span v-if="errors.length > 0" class="badge bg-primary">
								{{ filteredErrors.length }} {{ filteredErrors.length === 1 ? 'Eintrag' : 'Einträge' }}
							</span>
						</div>
						<div class="card-body pb-3 pt-2">
							<div class="input-group input-group-lg">
								<span class="input-group-text"><i class="bi bi-search"></i></span>
								<input
									type="text"
									class="form-control"
									placeholder="Fehlercode oder Text suchen..."
									v-model="searchQuery" />
							</div>
						</div>
					</div>

					<!-- Loading -->
					<div v-if="loading" class="text-center py-5">
						<div class="spinner-border text-primary" role="status">
							<span class="visually-hidden">Laden...</span>
						</div>
						<p class="mt-3 text-secondary">Lade Fehlerseiten...</p>
					</div>

					<!-- Error -->
					<div v-else-if="loadError" class="alert alert-danger">
						<i class="bi bi-exclamation-triangle-fill me-2"></i>
						{{ loadError }}
					</div>

					<!-- Empty -->
					<div v-else-if="errors.length === 0" class="alert alert-info text-center shadow-sm">
						<i class="bi bi-info-circle me-2"></i>
						Noch keine Fehlerseiten konfiguriert.<br />
						<router-link to="/new" class="btn btn-primary mt-3">
							<i class="bi bi-plus-lg me-2"></i>Ersten Fehler anlegen
						</router-link>
					</div>

					<!-- No search results -->
					<div v-else-if="filteredErrors.length === 0 && searchQuery" class="alert alert-warning text-center shadow-sm">
						<i class="bi bi-search me-2"></i>
						Keine Einträge für "{{ searchQuery }}" gefunden.
					</div>

					<!-- Raster-Ansicht -->
					<div v-else-if="viewMode === 'grid'" class="d-flex flex-wrap gap-3 pb-3 align-items-stretch">
						<div
							v-for="entry in filteredErrors"
							:key="entry.code"
							class="card shadow-sm error-card error-card-grid">
							<div class="card-body d-flex flex-column align-items-center text-center gap-2 p-4">
								<div class="error-code-badge" :class="badgeClass(entry.code)">
									{{ entry.code }}
								</div>
								<div class="fw-semibold mt-1">{{ entry.text }}</div>
								<div class="text-muted small font-monospace">/error/{{ entry.code }}</div>
								<div class="d-flex gap-2 mt-auto pt-2">
									<router-link :to="'/' + entry.code + '/edit'" class="btn btn-sm btn-outline-secondary" title="Bearbeiten">
										<i class="bi bi-pencil"></i>
									</router-link>
									<button class="btn btn-sm btn-outline-danger" @click="deleteEntry(entry)" title="Löschen">
										<i class="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Listen-Ansicht -->
					<div v-else-if="viewMode === 'list'" class="d-flex flex-column gap-3">
						<div
							v-for="entry in filteredErrors"
							:key="entry.code"
							class="card shadow-sm error-card">
							<div class="card-body d-flex align-items-center gap-3">
								<div class="error-code-badge" :class="badgeClass(entry.code)">{{ entry.code }}</div>
								<div class="flex-grow-1">
									<div class="fw-semibold">{{ entry.text }}</div>
									<div class="text-muted small mt-1">
										<i class="bi bi-link-45deg me-1"></i>
										<span class="font-monospace">/error/{{ entry.code }}</span>
									</div>
								</div>
								<div class="d-flex gap-2">
									<router-link :to="'/' + entry.code + '/edit'" class="btn btn-sm btn-outline-secondary" title="Bearbeiten">
										<i class="bi bi-pencil"></i>
									</router-link>
									<button class="btn btn-sm btn-outline-danger" @click="deleteEntry(entry)" title="Löschen">
										<i class="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Tabellen-Ansicht -->
					<div v-else-if="viewMode === 'table'" class="card shadow-sm">
						<div class="table-responsive">
							<table class="table table-hover mb-0">
								<thead>
									<tr>
										<th style="width:100px">Code</th>
										<th>Fehlermeldung</th>
										<th style="width:80px">URL</th>
										<th style="width:100px"></th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="entry in filteredErrors" :key="entry.code">
										<td>
											<span class="badge fs-6 font-monospace" :class="tableBadgeClass(entry.code)">{{ entry.code }}</span>
										</td>
										<td class="fw-semibold align-middle">{{ entry.text }}</td>
										<td class="align-middle">
											<span class="text-muted small font-monospace">/error/{{ entry.code }}</span>
										</td>
										<td class="text-end align-middle">
											<router-link :to="'/' + entry.code + '/edit'" class="btn btn-sm btn-outline-secondary me-1" title="Bearbeiten">
												<i class="bi bi-pencil"></i>
											</router-link>
											<button class="btn btn-sm btn-outline-danger" @click="deleteEntry(entry)" title="Löschen">
												<i class="bi bi-trash"></i>
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

				</div>
			</div>
		</main>

		<!-- Löschen Bestätigung Modal -->
		<div class="modal fade" id="deleteModal" tabindex="-1">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">
							<i class="bi bi-trash text-danger me-2"></i>Fehler löschen
						</h5>
						<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
					</div>
					<div class="modal-body">
						<p>Soll der Fehlercode <strong>{{ pendingDelete?.code }}</strong> wirklich gelöscht werden?</p>
						<p class="text-muted small mb-0">
							<i class="bi bi-info-circle me-1"></i>
							Diese Aktion kann nicht rückgängig gemacht werden.
						</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
						<button type="button" class="btn btn-danger" @click="confirmDelete">
							<i class="bi bi-trash me-2"></i>Löschen
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import Navbar from '@/components/Navbar.vue'
import ErrorListSidebar from '@/components/ErrorListSidebar.vue'
import { toastBus } from '@/lib/toastBus'

const errors      = ref([])
const loading     = ref(false)
const loadError   = ref(null)
const searchQuery = ref('')
const pendingDelete = ref(null)
const viewMode    = ref('list')
let deleteModal = null

const filteredErrors = computed(() => {
	if (!searchQuery.value) return errors.value
	const q = searchQuery.value.toLowerCase()
	return errors.value.filter(e =>
		e.code.toLowerCase().includes(q) || e.text.toLowerCase().includes(q)
	)
})

function badgeClass(code) {
	const n = Number(code)
	if (n >= 500) return 'badge-5xx'
	if (n >= 400) return 'badge-4xx'
	if (n >= 300) return 'badge-3xx'
	return 'badge-other'
}

function tableBadgeClass(code) {
	const n = Number(code)
	if (n >= 500) return 'bg-danger'
	if (n >= 400) return 'bg-warning text-dark'
	if (n >= 300) return 'bg-primary'
	return 'bg-secondary'
}

async function loadErrors() {
	loading.value = true
	loadError.value = null
	try {
		const res = await fetch('/error/errors', { headers: { Accept: 'application/json' } })
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		errors.value = await res.json()
	} catch (err) {
		loadError.value = 'Fehler beim Laden: ' + err.message
	} finally {
		loading.value = false
	}
}

function deleteEntry(entry) {
	pendingDelete.value = entry
	deleteModal?.show()
}

async function confirmDelete() {
	if (!pendingDelete.value) return
	deleteModal?.hide()
	try {
		const res = await fetch(`/error/errors/${pendingDelete.value.code}`, {
			method: 'DELETE',
			headers: { Accept: 'application/json' },
		})
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		toastBus.emit('toast', { text: `✅ Fehler ${pendingDelete.value.code} gelöscht.`, type: 'success' })
		await loadErrors()
	} catch (err) {
		toastBus.emit('toast', { text: '❌ Fehler beim Löschen: ' + err.message, type: 'danger' })
	} finally {
		pendingDelete.value = null
	}
}

onMounted(() => {
	loadErrors()
	deleteModal = new Modal(document.getElementById('deleteModal'))
})
</script>

<style scoped>
.error-card {
	background: #fff;
	transition: box-shadow 0.15s;
}
.error-card:hover {
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}
.error-code-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 64px;
	height: 48px;
	border-radius: 10px;
	font-size: 1.25rem;
	font-weight: 700;
	font-family: monospace;
	flex-shrink: 0;
}
.badge-4xx { background: #fef3c7; color: #92400e; }
.badge-5xx { background: #fee2e2; color: #991b1b; }
.badge-3xx { background: #dbeafe; color: #1e40af; }
.badge-other { background: #f3f4f6; color: #374151; }
</style>
