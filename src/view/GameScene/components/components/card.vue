<template>
  <div
    :class="sCardClass"
    :style="fCheckCardColor(nCard)">
    <div v-if="bShowCardsVal" calss="cardval">{{nCard|ftCardVal}}</div>
    <div v-if="bShowCardsVal" class="cardtype">{{nCard|ftCardType}}</div>
  </div>
</template>

<script>
import {GameServer} from '@/components/Card/GameServer.js';

export default {
  name: 'card',
  props: ['nCard', 'nSizeType', 'bSelected', 'bPicked', 'bCardBack'],
  data () {
    return {
    }
  },
  directives: {
  },
  filters: {
    ftCardType(nCard) {
      let nType = GameServer.getCardType(nCard);
      let aType = ['♦', '♣', '♠', '♥', ''];
      return aType[nType];
    },
    ftCardVal(nCard) {
      let nVal = GameServer.getCardVal(nCard);
      return nVal;
    }
  },
  watch: {
  },
  computed: {
    sCardClass() {
      let aSize = ['handcard', 'outcard'];
      return {
        'handcard': this.nSizeType == 0,
        'outcard':  this.nSizeType == 1,
        'move-up': this.bSelected,
        'picking': this.bPicked
      };
    },
    bShowCardsVal() {
      return !this.bCardBack;
    }
  },
  methods: {
    fCheckCardColor(nCard) {
      let nType = GameServer.getCardType(nCard);
      let oColor = {'color': '#000000'};
      if (nType == 0 || nType == 3 || nCard == 54) {
        oColor['color'] = '#9c2023';
      }
      return oColor;
    }
  },
  mounted() {
    // this.bCanTouch = document.ontouchstart !== null;
  }
}
</script>
