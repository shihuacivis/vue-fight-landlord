<template>
  <div class="handcards-container selfcards-container">
    <div class="outcards">
      <div v-if="nCallLandlord">{{nCallLandlord | ftCallLandlord}}</div>
      <div v-if="bNoOut">不出</div>
      <card :nCard="oCard" :nSizeType="1" :key="oCard" v-for="(oCard, index) in aOutCards"></card>
    </div>
    <div class="handcards" v-releaseoutside="handleReleaseOutside">
      <card 
        v-for="(oCard, index) in aHandCards"
        :nCard="oCard.nCard"
        :nSizeType="0"
        :key="oCard.nCard"
        :bSelected="oCard.bSelected"
        :bPicked="oCard.bPicked"
        @onPickCardStart="handlePickCardStart(oCard, index)"
        @onPickCardMove="handlePickCardMove(oCard, index)"
        @onPickCardEnd="handlePickCardEnd(oCard, index)"
      ></card>
    </div>
  </div>

</template>

<script>


import card from './components/card.vue';
import releaseoutside from '../../../directive/releaseoutside';
import {CardControler} from '@/components/Card/CardControler.js';

export default {
  name: 'selfcardsLayer',
  components: {
    card
  },
  directives: {
    releaseoutside,
  },
  props: ['aCards', 'aOutCards', 'nCallLandlord', 'bNoOut', 'oAgaOut', 'aSelfSelectCards'],
  data () {
    return {
      nStartIdx: -1,
      nEndIdx: -1,

      aPickedCards: [],
      aHandCards: [],
      aUpCards: []
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
      newVal.forEach((nCard)=>{
        var o = {nCard: nCard, bPicked: false, bSelected: false};
        aRet.push(o);
      });
      this.aHandCards = aRet;
    },
    'aSelfSelectCards' (newVal) {
      this.handleMoveUpCards(newVal);
    }
  },
  computed: {
  },
  methods: {
    handleReleaseOutside(e) {
      console.info(e);
      if (this.nStartIdx != -1) {
        this.handlePickCardEnd();
      } else {
        this.aPickedCards.length > 0 && this.handleMoveDownAllCards();
      }
    },
    handlePickCardStart(oCard = {}, index = -1) {
      if (this.nStartIdx != -1) {
        return;
      }
      let nCard = oCard.nCard || 0;
      this.nStartIdx = index;
      this.nEndIdx = index
      this.aPickedCards = [nCard];
      oCard.bPicked = true;
    },
    handlePickCardMove(oCard = {}, index = -1) {
      let nCard = oCard.nCard || 0;
      if (this.nStartIdx == -1 || this.nEndIdx == index) {
        return;
      }
      this.nEndIdx = index;
      let nMinIdx = Math.min(this.nStartIdx, this.nEndIdx);
      let nMaxIdx = Math.max(this.nStartIdx, this.nEndIdx);
      this.aPickedCards = [];
      this.aHandCards.forEach((oCard, idx)=>{
        oCard.bPicked = idx >= nMinIdx && idx <= nMaxIdx;
        oCard.bPicked && this.aPickedCards.push(oCard.nCard);
      });
    },
    handlePickCardEnd(oCard = {}, index = -1) {
      if (this.nStartIdx == -1) {
        return;
      }
      let nCard = oCard.nCard || 0;
      if (this.aPickedCards.indexOf(nCard) == -1 && nCard != 0) {
        this.aPickedCards.push(nCard);
      }
      this.aHandCards.forEach((oCard, idx)=>{
        oCard.bPicked = false;
      });
      this.nStartIdx = -1;
      let aSelCards = CardControler.fTouchCards(this.aPickedCards, this.aCards, this.aUpCards, this.oAgaOut);
      // console.info('选择卡牌:' + aSelCards);
      this.$emit('onChangeSelectCards', aSelCards);
    },
    handleMoveUpCards(aSelCards = []) {
      this.aHandCards.forEach((oCard, idx)=>{
        let nCard = oCard.nCard || 0;
        oCard.bSelected = aSelCards.indexOf(nCard) > -1;
      });
      this.aUpCards = aSelCards;
    },
    handleMoveDownAllCards() {
      this.aHandCards.forEach((oCard, idx)=>{
        oCard.bSelected = false;
      });
      this.aUpCards  = [];
      this.$emit('onChangeSelectCards', this.aUpCards);
    }
  }
}
</script>
