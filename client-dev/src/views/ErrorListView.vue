<template>
	<div class="container-fluid p-0">
		<Navbar />
		<ErrorListSidebar v-model:viewMode="viewMode" />
		<main class="container-fluid" style="padding-right: 68px">
			<div class="row justify-content-center pt-5">
				<div class="col-12 col-xl-11 col-xxl-10">

					<!-- Header Card -->
					<div class="error-list-header card shadow-sm mb-4">
						<div class="d-flex align-items-center justify-content-between mb-3">
							<h5 class="mb-0">
								<i class="bi bi-exclamation-triangle me-2 text-warning"></i>
								Fehlerseiten verwalten
							</h5>
							<span v-if="errors.length > 0" class="badge bg-primary fs-6">
								{{ filteredErrors.length }} {{ filteredErrors.length === 1 ? 'Eintrag' : 'Einträge' }}
							</span>
						</div>
						<div class="search-input-wrapper">
							<i class="bi bi-search search-icon"></i>
							<input
								type="text"
								class="form-control search-input"
								placeholder="Fehlercode oder Text suchen..."
								v-model="searchQuery" />
							<button
								v-if="searchQuery"
								class="btn-clear"
								type="button"
								@click="searchQuery = ''">
								<i class="bi bi-x-lg"></i>
							</button>
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
								<div class="d-flex gap-1 mt-auto pt-2">
									<router-link :to="'/' + entry.code + '/edit'" class="btn btn-sm btn-outline-primary table-action-btn" title="Bearbeiten">
										<i class="bi bi-pencil"></i>
									</router-link>
									<button class="btn btn-sm btn-outline-danger table-action-btn" @click="deleteEntry(entry)" title="Löschen">
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
									<div class="d-flex gap-1">
										<router-link :to="'/' + entry.code + '/edit'" class="btn btn-sm btn-outline-primary table-action-btn" title="Bearbeiten">
											<i class="bi bi-pencil"></i>
										</router-link>
										<button class="btn btn-sm btn-outline-danger table-action-btn" @click="deleteEntry(entry)" title="Löschen">
										<i class="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Tabellen-Ansicht -->
					<div v-else-if="viewMode === 'table'" class="table-responsive">
						<table ref="tableRef" class="table table-hover align-middle service-table" :class="{ 'fixed-layout': hasFixedLayout }">
							<colgroup>
								<col v-for="col in tableCols" :key="col.key" :style="columnWidths[col.key] ? { width: columnWidths[col.key] + 'px' } : {}">
								<col>
							</colgroup>
							<thead>
								<tr>
									<th v-for="(col, colIndex) in tableCols" :key="col.key"
										:class="col.sortable ? 'sortable-th' : ''"
										@click="col.sortable && sortByColumn(col.key)">
										<div class="th-content">
											<span>{{ col.label }}</span>
											<i v-if="col.sortable" class="bi sort-icon"
												:class="sortField === col.key
													? (sortOrder === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down')
													: 'bi-chevron-expand'"
												:style="{ opacity: sortField === col.key ? 1 : 0.25 }"></i>
										</div>
										<div v-if="col.sortable" class="col-resize-handle"
											@mousedown.stop="startResize(col.key, $event)"
											@click.stop
											@dblclick.stop="autoFitColumn(col.key, colIndex)"></div>
									</th>
									<th>Aktionen</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="entry in sortedErrors" :key="entry.code">
									<td>
										<span class="badge fs-6 font-monospace" :class="tableBadgeClass(entry.code)">{{ entry.code }}</span>
									</td>
									<td class="fw-semibold">{{ entry.text }}</td>
									<td>
										<span class="text-muted small font-monospace">/error/{{ entry.code }}</span>
									</td>
									<td class="text-end">
										<router-link :to="'/' + entry.code + '/edit'" class="btn btn-sm btn-outline-primary table-action-btn" title="Bearbeiten">
											<i class="bi bi-pencil"></i>
										</router-link>
										<button class="btn btn-sm btn-outline-danger table-action-btn" @click="deleteEntry(entry)" title="Löschen">
											<i class="bi bi-trash"></i>
										</button>
									</td>
								</tr>
							</tbody>
						</table>
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
import { ref, computed, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import Navbar from '@/components/Navbar.vue'
import ErrorListSidebar from '@/components/ErrorListSidebar.vue'
import { toastBus } from '@/lib/toastBus'

const errors      = ref([])
const loading     = ref(false)
const loadError   = ref(null)
const searchQuery = ref('')
const pendingDelete = ref(null)
const viewMode    = ref(localStorage.getItem('err-list-viewmode') || 'list')
watch(viewMode, (val) => localStorage.setItem('err-list-viewmode', val))
let deleteModal = null

// ─── Tabelle: Sortieren + Resize ───────────────────────────────────
const tableCols = [
	{ key: 'code', label: 'Code', sortable: true },
	{ key: 'text', label: 'Fehlermeldung', sortable: true },
	{ key: 'url', label: 'URL', sortable: false },
]
const tableRef = ref(null)
const columnWidths = ref({})
const sortField = ref('')
const sortOrder = ref('asc')
const hasFixedLayout = computed(() => Object.keys(columnWidths.value).length > 0)

const sortedErrors = computed(() => {
	const result = [...filteredErrors.value]
	if (!sortField.value) return result
	return result.sort((a, b) => {
		let aVal = a[sortField.value] ?? ''
		let bVal = b[sortField.value] ?? ''
		if (sortField.value === 'code') { aVal = Number(aVal); bVal = Number(bVal) }
		const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal), 'de')
		return sortOrder.value === 'desc' ? -cmp : cmp
	})
})

function sortByColumn(key) {
	if (sortField.value === key) {
		sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
	} else {
		sortField.value = key
		sortOrder.value = 'asc'
	}
}

function startResize(key, e) {
	const table = tableRef.value
	if (!table) return
	if (Object.keys(columnWidths.value).length === 0) {
		const ths = table.querySelectorAll('thead th')
		const widths = {}
		tableCols.forEach((col, i) => { widths[col.key] = ths[i]?.offsetWidth ?? 120 })
		columnWidths.value = widths
	}
	const startX = e.clientX
	const startW = columnWidths.value[key] ?? 120
	function onMove(ev) {
		columnWidths.value = { ...columnWidths.value, [key]: Math.max(60, startW + ev.clientX - startX) }
	}
	function onUp() {
		document.removeEventListener('mousemove', onMove)
		document.removeEventListener('mouseup', onUp)
	}
	document.addEventListener('mousemove', onMove)
	document.addEventListener('mouseup', onUp)
}

function autoFitColumn(key, colIndex) {
	const table = tableRef.value
	if (!table) return
	if (Object.keys(columnWidths.value).length === 0) {
		const ths = table.querySelectorAll('thead th')
		const widths = {}
		tableCols.forEach((col, i) => { widths[col.key] = ths[i]?.offsetWidth ?? 120 })
		columnWidths.value = widths
	}
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')
	const headerEl = table.querySelectorAll('thead th')[colIndex]
	if (headerEl) ctx.font = getComputedStyle(headerEl).font
	let maxW = headerEl ? headerEl.querySelector('.th-content span')?.scrollWidth ?? 60 : 60
	const cellEls = table.querySelectorAll(`tbody tr td:nth-child(${colIndex + 1})`)
	cellEls.forEach(td => {
		const text = td.textContent?.trim() ?? ''
		const w = ctx.measureText(text).width + 32
		if (w > maxW) maxW = w
	})
	columnWidths.value = { ...columnWidths.value, [key]: Math.max(60, Math.ceil(maxW)) }
}

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
.service-table {
	background: white;
	border-radius: 12px;
	box-shadow: 0 0.125rem 1rem rgba(0, 0, 0, 0.075);
}
.table-responsive {
	border-radius: 12px;
	overflow-x: auto;
}
.service-table thead th {
	background: #f8f9fa;
	font-size: 0.83rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #6c757d;
	border-bottom: 2px solid #dee2e6;
	white-space: nowrap;
	padding: 1rem 1rem;
}
.service-table tbody td {
	padding: 0.85rem 1rem;
	vertical-align: middle;
}
.sortable-th { cursor: pointer; user-select: none; position: relative; padding-right: 24px !important; }
.sortable-th:hover { background: #eef2f7 !important; }
.th-content { display: flex; align-items: center; gap: 0.35rem; min-width: 0; }
.th-content span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sort-icon { flex-shrink: 0; font-size: 0.75rem; transition: opacity 0.15s; }
.col-resize-handle { position: absolute; top: 0; right: 0; width: 6px; height: 100%; cursor: col-resize; z-index: 3; }
.col-resize-handle:hover { background: rgba(13, 110, 253, 0.25); }
.fixed-layout { table-layout: fixed; }
.fixed-layout thead th { min-width: unset; }
.table-action-btn { padding: 0.25rem 0.5rem; margin-left: 0.2rem; border-radius: 6px; font-size: 0.8rem; }
.error-list-header {
	border-radius: 16px !important;
	border: none !important;
	overflow: hidden;
	padding: 2rem 2rem 1.5rem 2rem;
	background: #fff;
}
.search-input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}
.search-icon {
	position: absolute;
	left: 1rem;
	color: #6c757d;
	font-size: 1rem;
	pointer-events: none;
	z-index: 10;
}
.search-input {
	border: 2px solid #e9ecef;
	border-radius: 10px;
	padding: 0.625rem 3rem 0.625rem 2.75rem;
	font-size: 0.95rem;
	transition: all 0.2s ease;
	background-color: #f8f9fa;
	width: 100%;
}
.search-input:hover { border-color: #cbd5e0; }
.search-input:focus {
	border-color: #0d6efd;
	box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
	background-color: white;
}
.btn-clear {
	position: absolute;
	right: 0.5rem;
	border: none;
	background: transparent;
	color: #6c757d;
	padding: 0.375rem 0.5rem;
	cursor: pointer;
	border-radius: 6px;
	transition: all 0.2s ease;
}
.btn-clear:hover { background-color: #f1f3f5; color: #495057; }
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
