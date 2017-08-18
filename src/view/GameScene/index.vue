<template>
  <div class="game-scene">
    <selfcardsLayer :aCards="aSelfCards" :aOutCards="aSelfOut" :nCallLandlord="nSelfCallLandlord" :bNoOut="bSelfNoOut"></selfcardsLayer>
    <basecardsLayer :aCards="aBaseCards" :nBaseScore="nBaseScore" :nMult="nMult" :sBaseCardsType="sBaseCardsType" :sBanker="sWhoIsBanker" :nSpread="nSpread"></basecardsLayer>
    <agacardsLayer :aCards="aAgaCards" :aOutCards="aAgaOut" :nCallLandlord="nAgaCallLandlord" :bNoOut="bAgaNoOut"></agacardsLayer>
    <resultLayer v-show="oResult.sWinner != ''" :sWinner="oResult.sWinner" :sWinnerType="oResult.sWinnerType"></resultLayer>
    <div class="menu-container">
      <div class="btn-start" @click="handleBtnStart">{{sBtnWords}}</div>
    </div>
  </div>
</template>

<script>
import './scss/game-scene.scss';
import './scss/cards-layer.scss';
import selfcardsLayer from './components/selfcards-layer.vue';
import agacardsLayer from './components/agacards-layer.vue';
import basecardsLayer from './components/basecards-layer.vue';
import resultLayer from './components/result-layer.vue';

import {GameServer,oGameData} from '@/components/Card/GameServer.js';
import {CardHelper} from '@/components/Card/CardHelper.js';
import {CardControler} from '@/components/Card/CardControler.js';

export default {
  components: {
    selfcardsLayer,
    agacardsLayer,
    basecardsLayer,
    resultLayer
  },
  name: 'hello',
  data () {
    return oGameData
  },
  watch: {
    'aSelfCards': (newVal) => {
      // console.info(newVal);
    }
  },
  computed: {
    aAgaOut() {
      let oLastOut = this.oLastOut || {nSeat: -1, aCards: [], nPower: 0,nType: 0};
      let nSeat = oLastOut.nSeat || 0;
      let aOut = nSeat == this.nAgaSeat ? oLastOut.aCards : [];
      return aOut;
    },
    aSelfOut() {
      let oLastOut = this.oLastOut || {nSeat: -1, aCards: [], nPower: 0,nType: 0};
      let nSeat = oLastOut.nSeat;
      let aOut = nSeat == this.nSelfSeat ? oLastOut.aCards : [];
      return aOut;
    },
    bSelfNoOut() {
      let oLastOut = this.oLastOut || {nSeat: -1, aCards: [], nPower: 0,nType: 0};
      let nSeat = oLastOut.nSeat || 0;
      let bOut = nSeat == this.nSelfSeat && oLastOut.aCards.length == 0;
      return bOut;
    },
    bAgaNoOut() {
      let oLastOut = this.oLastOut || {nSeat: -1, aCards: [], nPower: 0,nType: 0};
      let nSeat = oLastOut.nSeat;
      let bOut = nSeat == this.nAgaSeat && oLastOut.aCards.length == 0;
      return bOut;
    },
    nAgaCallLandlord() {
      if (this.nBankerSeat > -1) {
        return 0;
      }
      let oCallLandlord = this.oCallLandlord || {nSeat: -1, nStep: 0, bPower: false};
      let nSeat = oCallLandlord.nSeat;
      let nStep = oCallLandlord.nStep;
      let nVal = oCallLandlord.bPower ? 1 : 2
      let nCall = nSeat == this.nAgaSeat ? (nStep * 2 + nVal) : 0;
      return nCall;
    },
    nSelfCallLandlord() {
      if (this.nBankerSeat > -1) {
        return 0;
      }
      let oCallLandlord = this.oCallLandlord || {nSeat: -1, nStep: 0, bPower: false};
      let nSeat = oCallLandlord.nSeat;
      let nStep = oCallLandlord.nStep;
      let nVal = oCallLandlord.bPower ? 1 : 2
      let nCall = nSeat == this.nSelfSeat ? (nStep * 2 + nVal) : 0;
      return nCall;
    },
    nMult() {
      let nTotal = 1;
      let len = this.aMult.length || 0;
      for (let i = 0; i < len; i++) {
        let nVal = this.aMult[i];
        nTotal = nTotal * nVal;
      }
      return nTotal;
    },
    sWhoIsBanker() {
      if (this.nBankerSeat == this.nSelfSeat) {
        return '我方';
      } else if (this.nBankerSeat == this.nAgaSeat) {
        return '对方'
      }
      return '';
    },
    sBtnWords() {
      return this.bStartGame ? '重新开始' : '开始游戏'
    }
  },
  mounted() {
  },
  methods: {
    handleBtnStart() {
      GameServer.startGame();
    }
  }
}
</script>
