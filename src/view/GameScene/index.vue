<template>
  <div class="game-scene">
    <selfcardsLayer :aCards="aSelfCards"></selfcardsLayer>
    <agacardsLayer :aCards="aSelfCards"></agacardsLayer>
  </div>
</template>

<script>
import './scss/game-scene.scss';
import selfcardsLayer from './components/selfcards-layer.vue';
import agacardsLayer from './components/agacards-layer.vue';

import {GameServer} from '@/components/Card/GameServer.js';
import {CardHelper} from '@/components/Card/CardHelper.js';
import {CardControler} from '@/components/Card/CardControler.js';
// import {EventManager} from '@/components/Card/CardControler.js';

export default {
  components: {
    selfcardsLayer,
    agacardsLayer,
  },
  name: 'hello',
  data () {
    return {
      aSelfCards: [1,2,3,4,5,6,7]
    }
  },
  watch: {
    '$store.state.gameModule.aSelfCards': (newVal) => {
      console.info(newVal);
    }
  },
  mounted() {
    GameServer.startGame();
  }
}
</script>
