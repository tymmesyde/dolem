import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';
import App from './App.vue';

Vue.use(VueScrollTo);

Vue.config.productionTip = false;
Vue.config.ignoredElements = ['ion-icon'];

new Vue({
  render: h => h(App),
}).$mount('#app');
