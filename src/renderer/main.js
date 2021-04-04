import { createApp } from 'vue';
import App from './App.vue';

import Ionicons from './plugins/ionicons';
import VueScrollTo from 'vue-scrollto';

createApp(App)
  .use(Ionicons)
  .use(VueScrollTo)
  .mount('#app');