import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import gameModule from './modules/game.js'

export default new Vuex.Store({
  modules: {
    gameModule
  }
})