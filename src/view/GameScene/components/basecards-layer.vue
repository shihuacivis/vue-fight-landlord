<template>
  <div class="handcards-container basecards-container">
    <div class="basecards">
      <card :nCard="oCard" :nSizeType="0" :key="oCard" v-for="(oCard, index) in aCards"></card>
    </div>
    <div class="game-info">
      <div class="base-type">底牌类型：{{sBaseCardsType}}</div>
      <div class="base-score">底分：{{nBaseScore}}</div>
      <div class="mult">倍数：{{nMult}}</div>
      <div class="spread">让牌数：{{nSpread}}</div>
      <div v-show="sBanker != ''" class="banker">地主方：{{sBanker}}</div>
    </div>
  </div>
</template>

<script>

import card from './components/card.vue';

export default {
  name: 'basecardsLayer',
  components: {
    card
  },
  props: ['aCards', 'nBaseScore', 'nMult', 'sBaseCardsType', 'sBanker', 'nSpread'],
  data () {
    return {
    }
  },
  filters: {
  },
  methods: {
  }
}
</script>
