<template>
	<div class="container-fluid p-0">
		<Navbar />
		<main class="container-fluid" style="padding-right: 68px">
			<div class="row justify-content-center pt-5">
				<div class="col-lg-6 text-center">
					<div class="card shadow-sm p-5">
						<i class="bi bi-question-circle text-secondary" style="font-size: 4rem"></i>
						<h2 class="mt-3">Seite nicht gefunden</h2>
						<p class="text-muted">Die angeforderte Seite existiert nicht.</p>
						<router-link to="/" class="btn btn-primary">
							<i class="bi bi-arrow-left me-2"></i>Zur Übersicht
						</router-link>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>
