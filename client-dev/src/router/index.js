import { createRouter, createWebHistory } from 'vue-router'

import ErrorListView from '../views/ErrorListView.vue'
import ErrorFormView from '../views/ErrorFormView.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
	history: createWebHistory('/error/app'),
	routes: [
		{
			path: '/',
			name: 'ErrorList',
			component: ErrorListView,
		},
		{
			path: '/new',
			name: 'ErrorNew',
			component: ErrorFormView,
		},
		{
			path: '/:code/edit',
			name: 'ErrorEdit',
			props: true,
			component: ErrorFormView,
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'NotFound',
			component: NotFound,
		},
	],
})

export default router
