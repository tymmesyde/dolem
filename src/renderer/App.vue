<template class="hide">
	<div id="app-container" :class="{ 'slide-up': show, 'slide-down': !show }">

		<Header @hideWindow="toggleWindow()">
			<Toggle v-model="toggle" class="toggle"></Toggle>
		</Header>

		<Status v-model="toggle"/>

		<History/>

	</div>
</template>

<script>
import Header from './components/Header.vue';
import Toggle from './components/Toggle.vue';
import Status from './components/Status.vue';
import History from './components/History.vue';

import { Electron } from './services';

export default {
	name: 'App',
	components: {
		Header,
		Toggle,
		Status,
		History
	},
	watch: {
        async toggle() {
			this.toggle = await Electron.toggleProxy(this.toggle);
        }
    },
	data() {
		return {
			toggle: false,
			show: true
		}
	},
	methods: {
		async toggleWindow() {
			Electron.toggleWindow();
		}
	},
	mounted() {
		Electron.onWindowShow(() => {
			this.show = true;
		});
		Electron.onWindowHide(() => {
			this.show = false;
			setTimeout(() => Electron.hideWindow(), 500);
		});
	}
}
</script>

<style lang="scss">
@import './assets/styles/main.scss';

#app-container {
	display: grid;
	grid-template-rows: auto 1fr auto;
	height: 100%;
	background-color: $background-color;
	user-select: none;
}

.slide-up {
	animation: slideUp 0.5s ease-in-out forwards;
}

.slide-down {
	animation: slideDown 0.5s ease-in-out forwards;
}

@keyframes slideUp {
	0% {
		opacity: 0;
		transform: translateY(100vh);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes slideDown {
	0% {
		opacity: 1;
		transform: translateY(0);
	}
	100% {
		opacity: 0;
		transform: translateY(100vh);
	}
}
</style>
