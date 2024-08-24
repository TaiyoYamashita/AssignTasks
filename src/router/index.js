import { createRouter, createWebHistory } from 'vue-router';
import Login from '../resources/Login.vue';
import Register from '../resources/Register.vue';
import Room from '../resources/Room.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/room/:roomId',
    name: 'Room',
    component: Room
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router;
