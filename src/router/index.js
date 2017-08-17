import Vue from 'vue'
import Router from 'vue-router'
import GameScene from '@/view/GameScene/index.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'GameScene',
      component: GameScene
    }
  ]
})
