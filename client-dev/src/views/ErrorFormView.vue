<template>
	<div class="container-fluid p-0">
		<Navbar />
		<ErrorFormSidebar @back="goBack" @save="onSubmit" />
		<main class="container-fluid" style="padding-right: 68px">
			<div class="row justify-content-center pt-5">
				<div class="col-12 col-xl-11 col-xxl-10">

					<div class="card shadow-sm">
						<div class="card-header bg-white d-flex align-items-center gap-2">
							<i class="bi" :class="isEdit ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-success'"></i>
							<h5 class="mb-0">
								{{ isEdit ? `Fehler ${code} bearbeiten` : 'Neuen Fehler anlegen' }}
							</h5>
						</div>
						<div class="card-body p-4">

							<div v-if="loadError" class="alert alert-danger mb-4">
								<i class="bi bi-exclamation-triangle-fill me-2"></i>{{ loadError }}
							</div>

							<form @submit.prevent="onSubmit" novalidate>

								<!-- Code -->
								<div class="mb-4">
									<label for="code" class="form-label fw-semibold">
										HTTP-Fehlercode
										<span class="text-danger">*</span>
									</label>
									<input
										id="code"
										type="text"
										class="form-control form-control-lg font-monospace"
										:class="{ 'is-invalid': errors.code }"
										v-model="form.code"
										placeholder="z.B. 404, 500, 403 ..."
										:readonly="isEdit"
										required />
									<div class="invalid-feedback">{{ errors.code }}</div>
									<div v-if="isEdit" class="form-text">
										<i class="bi bi-info-circle me-1"></i>
										Der Fehlercode kann beim Bearbeiten nicht geändert werden.
										Lösche den Eintrag und lege ihn neu an, um den Code zu ändern.
									</div>
									<div v-else class="form-text">
										Numerischer HTTP-Statuscode (z.B. 404, 500, 403)
									</div>
								</div>

								<!-- Text -->
								<div class="mb-4">
									<label for="text" class="form-label fw-semibold">
										Fehlermeldung
										<span class="text-danger">*</span>
									</label>
									<input
										id="text"
										type="text"
										class="form-control form-control-lg"
										:class="{ 'is-invalid': errors.text }"
										v-model="form.text"
										placeholder="z.B. Diese Seite wurde nicht gefunden"
										required />
									<div class="invalid-feedback">{{ errors.text }}</div>
									<div class="form-text">
										Diese Meldung wird dem Benutzer auf der Fehlerseite angezeigt.
									</div>
								</div>

								<!-- Vorschau -->
								<div v-if="form.code || form.text" class="alert alert-light border mb-4">
									<div class="d-flex align-items-center gap-3">
										<div class="preview-code" :class="previewBadgeClass">{{ form.code || '—' }}</div>
										<div>
											<div class="fw-semibold">{{ form.text || '—' }}</div>
											<div class="text-muted small font-monospace">/error/{{ form.code || '...' }}</div>
										</div>
									</div>
								</div>

							</form>
						</div>
					</div>

				</div>
			</div>
		</main>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import ErrorFormSidebar from '@/components/ErrorFormSidebar.vue'
import { toastBus } from '@/lib/toastBus'

const props = defineProps({
	code: { type: String, default: null },
})

const router = useRouter()
const isEdit = computed(() => !!props.code)

const form = reactive({ code: '', text: '' })
const errors = reactive({ code: '', text: '' })
const loadError = ref(null)
const saving = ref(false)

const previewBadgeClass = computed(() => {
	const n = Number(form.code)
	if (n >= 500) return 'badge-5xx'
	if (n >= 400) return 'badge-4xx'
	if (n >= 300) return 'badge-3xx'
	return 'badge-other'
})

async function loadEntry() {
	if (!props.code) return
	try {
		const res = await fetch('/error/errors', { headers: { Accept: 'application/json' } })
		if (!res.ok) throw new Error(`HTTP ${res.status}`)
		const list = await res.json()
		const entry = list.find(e => e.code === props.code)
		if (!entry) throw new Error('Eintrag nicht gefunden')
		form.code = entry.code
		form.text = entry.text
	} catch (err) {
		loadError.value = 'Fehler beim Laden: ' + err.message
	}
}

function validate() {
	let valid = true
	errors.code = ''
	errors.text = ''
	if (!form.code.trim()) {
		errors.code = 'Bitte einen Fehlercode eingeben.'
		valid = false
	}
	if (!form.text.trim()) {
		errors.text = 'Bitte eine Fehlermeldung eingeben.'
		valid = false
	}
	return valid
}

async function onSubmit() {
	if (!validate()) return
	saving.value = true
	try {
		let res
		if (isEdit.value) {
			res = await fetch(`/error/errors/${props.code}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ text: form.text }),
			})
		} else {
			res = await fetch('/error/errors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({ code: form.code.trim(), text: form.text.trim() }),
			})
		}
		if (!res.ok) {
			const data = await res.json().catch(() => ({}))
			throw new Error(data.error || `HTTP ${res.status}`)
		}
		toastBus.emit('toast', { text: `✅ Fehler ${form.code} erfolgreich gespeichert.`, type: 'success' })
		router.push('/')
	} catch (err) {
		toastBus.emit('toast', { text: '❌ ' + err.message, type: 'danger' })
	} finally {
		saving.value = false
	}
}

function goBack() {
	router.push('/')
}

onMounted(() => {
	loadEntry()
})
</script>

<style scoped>
.preview-code {
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

.form-control:focus {
	border-color: #1976d2;
	box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.1);
}
</style>
