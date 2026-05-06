<template>
	<nav class="action-sidebar" :class="{ expanded: isExpanded }">

		<!-- Toggle -->
		<button class="sb-toggle" @click="isExpanded = !isExpanded"
			:title="isExpanded ? 'Einklappen' : 'Ausklappen'">
			<i class="bi" :class="isExpanded ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
		</button>

		<div class="sb-sep" />

		<!-- Gruppe: Neu anlegen -->
		<div class="sb-group" :ref="el => { groupRefMap.create = el }">
			<button v-if="!isExpanded" class="sb-icon create"
				:class="{ 'flyout-open': openFlyout === 'create' }"
				@click="toggleFlyout('create')"
				title="Neuen Fehler anlegen">
				<i class="bi bi-plus-circle-fill"></i>
			</button>
			<button v-if="isExpanded" class="sb-group-hd"
				:class="{ open: openGroups.create }"
				@click="openGroups.create = !openGroups.create">
				<i class="bi bi-plus-circle gh-icon text-success"></i>
				<span class="gh-label">Aktionen</span>
				<i class="bi gh-chev" :class="openGroups.create ? 'bi-chevron-down' : 'bi-chevron-left'"></i>
			</button>
			<div v-if="isExpanded && openGroups.create" class="sb-group-body">
				<router-link to="/new" class="sb-item create">
					<i class="bi bi-plus-lg si"></i><span>Neuer Fehler</span>
				</router-link>
			</div>
			<Teleport to="body">
				<div class="sb-flyout" v-show="!isExpanded && openFlyout === 'create'" :style="flyoutStyle('create')">
					<div class="flyout-title">Aktionen</div>
					<router-link to="/new" class="flyout-item create" @click="openFlyout = null">
						<i class="bi bi-plus-lg"></i><span>Neuer Fehler</span>
					</router-link>
				</div>
			</Teleport>
		</div>

		<div class="sb-sep" />

		<!-- Gruppe: Ansicht -->
		<div class="sb-group" :ref="el => { groupRefMap.view = el }">
			<button v-if="!isExpanded" class="sb-icon"
				:class="{ 'flyout-open': openFlyout === 'view' }"
				@click="toggleFlyout('view')" title="Ansicht">
				<i class="bi" :class="viewModeIcon"></i>
			</button>
			<button v-if="isExpanded" class="sb-group-hd"
				:class="{ open: openGroups.view }"
				@click="openGroups.view = !openGroups.view">
				<i class="bi gh-icon" :class="viewModeIcon"></i>
				<span class="gh-label">Ansicht</span>
				<i class="bi gh-chev" :class="openGroups.view ? 'bi-chevron-down' : 'bi-chevron-left'"></i>
			</button>
			<div v-if="isExpanded && openGroups.view" class="sb-group-body">
				<button class="sb-item" :class="{ active: viewMode === 'grid' }"
					@click="$emit('update:viewMode', 'grid')">
					<i class="bi bi-grid si"></i><span>Raster</span>
				</button>
				<button class="sb-item" :class="{ active: viewMode === 'list' }"
					@click="$emit('update:viewMode', 'list')">
					<i class="bi bi-list-ul si"></i><span>Liste</span>
				</button>
				<button class="sb-item" :class="{ active: viewMode === 'table' }"
					@click="$emit('update:viewMode', 'table')">
					<i class="bi bi-table si"></i><span>Tabelle</span>
				</button>
			</div>
			<Teleport to="body">
				<div class="sb-flyout" v-show="!isExpanded && openFlyout === 'view'" :style="flyoutStyle('view')">
					<div class="flyout-title">Ansicht</div>
					<button class="flyout-item" :class="{ active: viewMode === 'grid' }"
						@click="$emit('update:viewMode', 'grid'); openFlyout = null">
						<i class="bi bi-grid"></i><span>Raster</span>
					</button>
					<button class="flyout-item" :class="{ active: viewMode === 'list' }"
						@click="$emit('update:viewMode', 'list'); openFlyout = null">
						<i class="bi bi-list-ul"></i><span>Liste</span>
					</button>
					<button class="flyout-item" :class="{ active: viewMode === 'table' }"
						@click="$emit('update:viewMode', 'table'); openFlyout = null">
						<i class="bi bi-table"></i><span>Tabelle</span>
					</button>
				</div>
			</Teleport>
		</div>

	</nav>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
	viewMode: { type: String, default: 'grid' },
})

defineEmits(['create', 'update:viewMode'])

const isExpanded  = ref(false)
const openFlyout  = ref(null)
const openGroups  = reactive({ create: true, view: true })
const groupRefMap = reactive({})

const viewModeIcon = computed(() => {
	if (props.viewMode === 'list')  return 'bi-list-ul'
	if (props.viewMode === 'table') return 'bi-table'
	return 'bi-grid'
})

function flyoutStyle(name) {
	const el = groupRefMap[name]
	if (!el) return {}
	const rect = el.getBoundingClientRect()
	return { position: 'fixed', top: rect.top + 'px', right: '52px', zIndex: 200 }
}

function toggleFlyout(name) {
	openFlyout.value = openFlyout.value === name ? null : name
}

function onClickOutside(e) {
	if (openFlyout.value && !e.target.closest('.sb-flyout') && !e.target.closest('.sb-icon')) {
		openFlyout.value = null
	}
}

watch(isExpanded, (val) => {
	localStorage.setItem('err-list-sidebar-expanded', String(val))
	openFlyout.value = null
})

onMounted(() => {
	const stored = localStorage.getItem('err-list-sidebar-expanded')
	if (stored !== null) isExpanded.value = stored === 'true'
	document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.action-sidebar {
	position: fixed;
	right: 0;
	top: 56px;
	height: calc(100vh - 56px);
	width: 52px;
	background: #ffffff;
	border-left: 1px solid #e9ecef;
	box-shadow: -2px 0 14px rgba(0, 0, 0, 0.07);
	z-index: 100;
	display: flex;
	flex-direction: column;
	transition: width 0.25s cubic-bezier(.4,0,.2,1);
	overflow-x: hidden;
	overflow-y: auto;
}
.action-sidebar.expanded { width: 240px; }
.sb-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 48px;
	border: none;
	background: transparent;
	color: #9ca3af;
	cursor: pointer;
	flex-shrink: 0;
	transition: background 0.15s, color 0.15s;
}
.sb-toggle:hover { background: #f5f5f5; color: #374151; }
.sb-sep { height: 1px; background: #f0f0f0; flex-shrink: 0; }
.sb-group { flex-shrink: 0; }
.sb-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 52px;
	height: 48px;
	border: none;
	background: transparent;
	color: #6b7280;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}
.sb-icon i { font-size: 18px; }
.sb-icon.create { color: #16a34a; }
.sb-icon.create:hover { background: #dcfce7; color: #15803d; }
.sb-icon.flyout-open { background: #dcfce7; color: #15803d; }
.sb-group-hd {
	display: flex;
	align-items: center;
	gap: 0.7rem;
	width: 100%;
	height: 48px;
	padding: 0 0.85rem;
	border: none;
	background: transparent;
	color: #374151;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	transition: background 0.15s;
	flex-shrink: 0;
}
.sb-group-hd:hover { background: #f5f5f5; }
.sb-group-hd.open { background: #f9fafb; }
.gh-icon { font-size: 16px; flex-shrink: 0; width: 16px; text-align: center; }
.gh-label { flex: 1; }
.gh-chev { font-size: 10px; color: #9ca3af; flex-shrink: 0; }
.sb-group-body { background: #fafafa; border-top: 1px solid #f0f0f0; padding: 0.2rem 0; }
.sb-item {
	display: flex;
	align-items: center;
	gap: 0.7rem;
	width: 100%;
	height: 42px;
	padding: 0 0.85rem 0 2.5rem;
	border: none;
	background: transparent;
	color: #6b7280;
	cursor: pointer;
	font-size: 0.875rem;
	white-space: nowrap;
	text-decoration: none;
	transition: background 0.15s, color 0.15s;
}
.sb-item.create { color: #16a34a; }
.sb-item.create:hover { background: #dcfce7; color: #15803d; }
.sb-item:hover { background: #eff6ff; color: #1d4ed8; }
.sb-item.active { color: #2563eb; font-weight: 600; background: #eff6ff; }
.si { font-size: 14px; flex-shrink: 0; }
.sb-flyout {
	background: #ffffff;
	border-radius: 10px 0 0 10px;
	box-shadow: -4px 4px 24px rgba(0,0,0,0.14);
	border: 1px solid rgba(0,0,0,0.06);
	border-right: none;
	min-width: 200px;
	padding-bottom: 0.5rem;
}
.flyout-title {
	padding: 0.65rem 1rem 0.45rem;
	font-size: 0.68rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.07em;
	color: #9ca3af;
	border-bottom: 1px solid #f0f0f0;
	margin-bottom: 0.2rem;
}
.flyout-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	width: 100%;
	height: 44px;
	padding: 0 1rem;
	border: none;
	background: transparent;
	color: #374151;
	cursor: pointer;
	font-size: 0.875rem;
	text-align: left;
	white-space: nowrap;
	text-decoration: none;
	transition: background 0.15s, color 0.15s;
}
.flyout-item.create { color: #16a34a; }
.flyout-item.create:hover { background: #dcfce7; color: #15803d; }
.flyout-item.active { color: #2563eb; font-weight: 600; background: #eff6ff; }
.flyout-item i { font-size: 16px; flex-shrink: 0; }
</style>
