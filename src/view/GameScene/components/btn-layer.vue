<template>
  <div class="btn-container">
    <div class="btn-group" v-show="nBtnGroupType == 1">
      <btn class="green" @click.native.stop="handleBtnCallLandlord(true)">叫地主</btn>
      <btn class="red" @click.native.stop="handleBtnCallLandlord(false)">不叫</btn>
    </div>
    <div class="btn-group" v-show="nBtnGroupType == 2">
      <btn class="green" @click.native.stop="handleBtnRobLandlord(true)">抢地主</btn>
      <btn class="red" @click.native.stop="handleBtnRobLandlord(false)">不抢</btn>
    </div>
    <div class="btn-group" v-show="nBtnGroupType == 3">
      <btn class="blue" @click.native.stop="handleBtnTips">提示</btn>
      <btn :class="{disabled: !bEnabledPlayCards, green: bEnabledPlayCards}" @click.native.stop="handleBtnPlayCards(true)">出牌</btn>
    </div>
    <div class="btn-group" v-show="nBtnGroupType == 4">
      <btn class="red" @click.native.stop="handleBtnPlayCards(false)">不出</btn>
      <btn class="blue" @click.native.stop="handleBtnTips">提示</btn>
      <btn :class="{disabled: !bEnabledPlayCards, green: bEnabledPlayCards}" @click.native.stop="handleBtnPlayCards(true)">出牌</btn>
    </div>
    <div class="btn-group" v-show="nBtnGroupType == 5">
      <btn class="red" @click.native.stop="handleBtnPlayCards(false)">要不起</btn>
    </div>
  </div>
</template>

<script>

import btn from './components/button.vue';
export default {
  name: 'btnLayer',
  components: {
    btn
  },
  props: ['nBtnGroupType', 'bEnabledPlayCards'],
  data () {
    return {
    }
  },
  watch: {
    'bEnabledPlayCards' (newVal) {
    }
  },
  filters: {
  },
  computed: {
  },
  methods: {
    handleBtnCallLandlord(bPower = false) {
      this.$emit('onBtnCallLandlord', bPower);
    },
    handleBtnRobLandlord(bPower = false) {
      this.$emit('onBtnRobLandlord', bPower);
    },
    handleBtnTips(bPower = false) {
      this.$emit('onBtnTips');
    },
    handleBtnPlayCards(bPower = false) {
      this.$emit('onBtnPlayCards', bPower);
    },
  }
}
</script>
