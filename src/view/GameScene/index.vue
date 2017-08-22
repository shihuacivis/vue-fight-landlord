<template>
  <div class="game-scene" id="game-scene">
    <selfcardsLayer
    :aCards="aSelfCards"
    :aOutCards="aSelfOut"
    :oAgaOut="oLastOut"
    :nCallLandlord="nSelfCallLandlord"
    :bNoOut="bSelfNoOut"
    :aSelfSelectCards="aSelfSelectCards"
    @onChangeSelectCards="handleChangeSelectCards"
    ></selfcardsLayer>
    <basecardsLayer :aCards="aBaseCards" :nBaseScore="nBaseScore" :nMult="nMult" :sBaseCardsType="sBaseCardsType" :sBanker="sWhoIsBanker" :nSpread="nSpread"></basecardsLayer>
    <agacardsLayer :aCards="aAgaCards" :aOutCards="aAgaOut" :nCallLandlord="nAgaCallLandlord" :bNoOut="bAgaNoOut"></agacardsLayer>
    <resultLayer v-show="oResult.sWinner != ''" :sWinner="oResult.sWinner" :sWinnerType="oResult.sWinnerType"></resultLayer>
    <btnLayer
    :nBtnGroupType="nBtnGroupType"
    :bEnabledPlayCards="bEnabledPlayCards"
    @onBtnCallLandlord="handleBtnCallLandlord"
    @onBtnRobLandlord="handleBtnRobLandlord"
    @onBtnTips="handleBtnTips"
    @onBtnPlayCards="handleBtnPlayCards"
    ></btnLayer>
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
import btnLayer from './components/btn-layer.vue';

import {GameServer,oGameData, GAMEPOWER} from '@/components/Card/GameServer.js';
import {CardHelper} from '@/components/Card/CardHelper.js';
import {CardControler} from '@/components/Card/CardControler.js';
import CARDSTYPE from '@/components/Card/CARDSTYPE.js';

export default {
  components: {
    selfcardsLayer,
    agacardsLayer,
    basecardsLayer,
    resultLayer,
    btnLayer
  },
  name: 'hello',
  data () {
    return oGameData
  },
  watch: {
    'oLastOut'(newVal = {nSeat: -1, aCards: [], nPower: 0,nType: 0}) {
      let {nSeat,aCards,nPower,nType} = newVal;
      if (nSeat == this.nAgaSeat) {
        let nNum = aCards.length;
        this.aSelfAvailCards = CardHelper.fGetAvailCards(this.aSelfCards, nType, nPower, nNum);
      }
    },
    'bAvailOutCards'(newVal) {
      console.info( newVal ? '能出' : '不能出');
    },
    'aSelfSelectCards'(aCards) {
      let nPower = CardControler.fGetCardsPower(aCards);
      let nType = CardControler.fGetCardsType(aCards);
      this.nSelfSelectCasrdsType = nType;
      this.nSelfSelectCasrdsPower = nPower;
      // 处理按钮
      let nCount = aCards.length;
      let oLastOut = this.oLastOut;
      let nLastCount = oLastOut.aCards && oLastOut.aCards.length ? oLastOut.aCards.length : 0;
      let nLastType = oLastOut.nType || 0;
      let nLastPower = oLastOut.nPower || 0;
      let bEnable = false;
      if (nType == CARDSTYPE.HUO_JIAN) {
        // 火箭最大
        bEnable = true;
      } else if (nType == CARDSTYPE.SI_ZHANG) {
        if (nLastType == CARDSTYPE.SI_ZHANG && nPower > nLastPower) {
          // 上家也是炸弹 则判断大小
          bEnable = true;
        } else if (nLastType != CARDSTYPE.SI_ZHANG && nLastType != CARDSTYPE.HUO_JIAN) {
          // 炸弹大于普通牌
          bEnable = true;
        }
      } else {
        if (nType == nLastType && nPower > nLastPower && nCount == nLastCount) {
          bEnable = true;
        } else if (nType != 0 && nLastCount == 0) {
          // 上家没出牌
          bEnable = true;
        }
      }
      if (nType == 0) {
        bEnable = false;
      }
      this.bAvailOutCards = bEnable;
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
      this.aSelfSelectCards = [];
      this.bAvailOutCards = false;
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
    },
    nBtnGroupType() {
      let nPower = this.nSelfPower;
      let nLastType = this.oLastOut.nType;
      if (nPower == GAMEPOWER.POWER_PLAY_CARD) {
        if (nLastType == 0) {
          // 必出
          return 3;
        } else if (this.aSelfAvailCards.length == 0) {
          return 5;
        } else {
          return 4;
        }
      } else {
        return nPower;
      }
    },
    bEnabledPlayCards() {
      let bEnable = this.bAvailOutCards && this.nSelfPower == GAMEPOWER.POWER_PLAY_CARD;
      return bEnable;
    }
  },
  mounted() {
  },
  methods: {
    handleBtnStart() {
      GameServer.startGame();
    },
    handleBtnCallLandlord(bPower = false) {
      GameServer.handleCallBanker({nSeat: this.nSelfSeat, bPower: bPower});
    },
    handleBtnRobLandlord(bPower = false) {
      GameServer.handleRobBanker({nSeat: this.nSelfSeat, bPower: bPower});
    },
    handleBtnTips() {
      let aCards = CardHelper.fGetHintCards();
      this.handleChangeSelectCards(aCards);
    },
    handleBtnPlayCards(bPower = false) {
      if (!bPower) {
        this.aSelfSelectCards = [];
        this.nSelfSelectCasrdsPower = 0;
        this.nSelfSelectCasrdsType = 0;
      }
      let oOutData = {
        nSeat: this.nSelfSeat,
        aCards: this.aSelfSelectCards,
        nPower: this.nSelfSelectCasrdsPower,
        nType: this.nSelfSelectCasrdsType
      }
      GameServer.handlePlayCards(oOutData);
    },
    handleChangeSelectCards(aCards = []) {
      this.aSelfSelectCards = aCards;
    }
  }
}
</script>
