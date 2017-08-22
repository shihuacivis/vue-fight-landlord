<template>
  <div 
    :class="sCardClass"
    :style="fCheckCardColor(nCard)"
    @mousedown.stop="handleSelect"
    @touchstart.stop="handleSelect"
    @mousemove.stop="handleMove"
    @touchmove.stop="handleMove"
    @mouseup.stop="handleRelease"
    @touchend.stop="handleRelease">
    <div>{{nCard|ftCardVal}}</div>
    <div class="cardtype">{{nCard|ftCardType}}</div>
  </div>
</template>

<script>
import {GameServer} from '@/components/Card/GameServer.js';
export default {
  name: 'basecardsLayer',
  props: ['nCard', 'nSizeType', 'bSelected', 'bPicked'],
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
    }
  },
  methods: {
    handleSelect() {
      !this.bPicked && this.$emit('onPickCardStart');
    },
    handleMove() {
      this.$emit('onPickCardMove');
    },
    handleRelease() {
      this.$emit('onPickCardEnd');
    },
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
