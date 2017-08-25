<template>
  <div class="handcards-container agacards-container">
    <div class="handcards">
      <card :nCard="oCard.nCard" :bCardBack="oCard.bCardBack" :nSizeType="0" :key="oCard.nTrueCard" v-for="(oCard, index) in aHandCards"></card>
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
  props: ['aCards', 'aOutCards', 'nCallLandlord', 'bNoOut', 'bStartGame', 'nBankerSeat', 'nMing'],
  data () {
    return {
      aHandCards: []
    }
  },
  filters: {
    ftCallLandlord(nCall) {
      let aStr = ['', '叫地主', '不叫', '抢地主', '不抢']
      return aStr[nCall]
    },
  },
  watch: {
    'aCards' (newVal) {
      let aRet = [];
      let bHavingMing = newVal.indexOf(this.nMing) > -1;
      newVal.forEach((nCard, index)=>{
        let bShowMing = (bHavingMing && index == 8 && this.nBankerSeat == -1 && this.bStartGame);
        // 抢地主阶段显示明牌
        let nCardVal = bShowMing ? this.nMing : nCard;
        let bShow = bShowMing || !this.bStartGame;
        var o = {nCard: nCardVal, bCardBack: !bShow, nTrueCard: nCard};
        aRet.push(o);
      });
      this.aHandCards = aRet;
    },
    'nBankerSeat' (newVal) {
      if (newVal != -1) {
        this.aHandCards.forEach((oCard)=>{
          oCard.bCardBack = true;
        });
      }
    },
    'bStartGame' (newVal) {
      if (newVal == false) {
        this.aHandCards.forEach((oCard)=>{
          oCard.bCardBack = false;
        });
      }
    }
  },
  computed: {
  }
}
</script>
