<template>
  <div class="handcards-container agacards-container">
    <div class="handcards">
      <card :nCard="oCard" :nSizeType="0" :key="oCard" v-for="(oCard, index) in aCards"></card>
    </div>
    <div class="outcards">
      <div v-if="nCallLandlord">{{nCallLandlord | ftCallLandlord}}</div>
      <div v-if="bNoOut">不出</div>
      <card :nCard="oCard" :nSizeType="1" :key="oCard" v-for="(oCard, index) in aOutCards"></card>
    </div>
  </div>
</template>

<script>

import card from './components/card.vue';
export default {
  name: 'agacardsLayer',
  components: {
    card
  },
  props: ['aCards', 'aOutCards', 'nCallLandlord', 'bNoOut'],
  data () {
    return {
    }
  },
  filters: {
    ftCallLandlord(nCall) {
      let aStr = ['', '叫地主', '不叫', '抢地主', '不抢']
      return aStr[nCall]
    },
  },
  methods: {
  }
}
</script>
