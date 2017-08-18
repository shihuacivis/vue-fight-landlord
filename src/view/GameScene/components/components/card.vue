<template>
  <div :class="sCardClass" :style="fCheckCardColor(nCard)">
    <div>{{nCard|ftCardVal}}</div>
    <div class="cardtype">{{nCard|ftCardType}}</div>
  </div>
</template>

<script>
import {GameServer} from '@/components/Card/GameServer.js';
export default {
  name: 'basecardsLayer',
  props: ['nCard', 'nSizeType'],
  data () {
    return {
    }
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
  computed: {
    sCardClass() {
      let aSize = ['handcard', 'outcard'];
      return aSize[this.nSizeType];
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
  }
}
</script>
