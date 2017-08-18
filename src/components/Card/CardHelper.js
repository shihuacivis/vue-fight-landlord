// 出牌提示组件

import CARDSTYPE from './CARDSTYPE.js';
import {CardControler} from './CardControler.js';

var CardHelper = {
  aHelpList: []
, nCurIdx: 0
, nMaxIdx: 0
, fGetAvailCards: function(aOriCards, typeid, nPower, nNum) {
    // 帮助选牌入口
    this.nCurIdx = 0;
    this.aHelpList = [];
    if (typeid == CARDSTYPE.HUO_JIAN) {
      this.aHelpList = [];
      this.nMaxIdx = 0;
    } else if (typeid == 0) {
      // 上家不出牌
      this.aHelpList = this.fGetFreeCards(aOriCards);
    } else {
      this.aHelpList = this.fCheckHintCards(typeid, nPower, nNum, aOriCards);
      // 最后加炸弹和火箭
      if (typeid != CARDSTYPE.SI_ZHANG) {
        var aBomb = this.fCheckHintCards(CARDSTYPE.SI_ZHANG, 0, 4, aOriCards);
        aBomb.length > 0 && (this.aHelpList = this.aHelpList.concat(aBomb));
      }
      var aRocket = this.fCheckHintCards(CARDSTYPE.HUO_JIAN, 0, 2, aOriCards);
      aRocket.length > 0 && (this.aHelpList = this.aHelpList.concat(aRocket));
      this.nMaxIdx = this.aHelpList.length;
    }
    return this.aHelpList;
  }
, fGetHintCards: function() {
    var self = this;
    if (self.aHelpList.length == 0) {
      return [];
    }
    var aRet = self.aHelpList[self.nCurIdx];
    self.nCurIdx++;
    self.nCurIdx = self.nCurIdx == self.nMaxIdx ? 0 : self.nCurIdx;
    return aRet;
  }
, fGetFreeCards: function(aOriCards) {
    // 自由出牌
    var self = this;
    this.aHelpList = [];
    this.nMaxIdx = 0;
    self.nCurIdx = 0;
    var aOriCards = aOriCards? aOriCards : [];
    var oCardVal = {};
    var aCardVal = [];
    var oCardNum = {
      '1': []
    , '2': []
    , '3': []
    , '4': []
    };
    // 小于10的单牌优先出
    for (var i = 0; i < aOriCards.length; i++) {
      var nCard = aOriCards[i];
      var nCardVal = self.fGetCardVal(nCard);
      !oCardVal[nCardVal] && (oCardVal[nCardVal] = []);
      oCardVal[nCardVal].push(nCard);
      aCardVal.indexOf(nCardVal) < 0 && aCardVal.push(nCardVal);
    }
    for (var i = 0; i < aCardVal.length; i++) {
      var nCardVal = aCardVal[i];
      var aCards = oCardVal[nCardVal];
      var nLen = aCards.length;
      oCardNum[nLen].push(nCardVal);
    }
    var tmpSingleArr = oCardNum['1'].sort(CardControler.SORTASC);
    var aRet = [];
    for(var i = 0; i < tmpSingleArr.length; i++) {
      var nPv = tmpSingleArr[i];
      if (nPv < 10) {
        var arr = oCardVal[nPv];
        aRet.push(arr);
      }
    }
    // 然后找顺子
    var aJunko = CardControler.fGetAutoJunkoCards(aOriCards, 1);
    if (aJunko.length > 0) {
      if (aRet > 0 && aJunko.indexOf(aRet[0])) {
        //  如果顺子包含最小的单牌 优先出顺子
        aRet.unshift(aJunko);
      } else {
        aRet.push(aJunko);
      }
    }
    // 然后找最小的牌
    if (aRet.length == 0) {
      aCardVal = aCardVal.sort(CardControler.SORTASC);
      for(var i = 0; i < aCardVal.length; i++) {
        var nPv = aCardVal[i];
        var aCards = oCardVal[nPv];
        if (aCards.length == 4 && aOriCards.length > 4) {
          // 最小的牌是炸弹且还有其它牌可出 优先考虑其他牌
          continue;
        } else if (aCards.length == 4 && aOriCards.length == 4) {
          // 炸弹是最后一副牌
          aRet.push(aCards);
        } else if (aCards.length == 3) {
          // 最小牌是3张时，优先找三带二三带一
          var aDouble = oCardNum['2'].sort(CardControler.SORTASC);
          var aSingle = oCardNum['1'].sort(CardControler.SORTASC);
          var nSelect = 0;
          if (aDouble.length > 0 && aSingle.length > 0) {
            // 优先选小的
            nSelect = Math.min(aDouble[0], aSingle[0]);
          } else if (aDouble.length > 0 && aSingle.length == 0) {
            nSelect = aDouble[0];
          } else if (aDouble.length == 0 && aSingle.length > 0 && ((aSingle[0] != 22 && aOriCards.length > 4) || (aSingle[0] == 22 && aOriCards.length == 4))) {
            // 只有单牌 且不只剩下小王 只剩小王的话可以选
            nSelect = aSingle[0];
          } else {
            // 其他情况只选自己
          }
          if (nSelect == 0) {
            aRet.push(aCards);
          } else {
            var aPlusCards = oCardVal[nSelect].concat();
            aCards = aCards.concat(aPlusCards);
            aRet.push(aCards);
          }
        } else {
          aRet.push(aCards);
        }
      }
    }
    if (aOriCards.length == 2 && aOriCards.indexOf(53) > -1 && aOriCards.indexOf(54) > -1) {
      aRet = [];
      aRet.push([54, 53]);
    }
    this.aHelpList = aRet;
    this.nMaxIdx = this.aHelpList.length;
    return aRet;
  }
, fCheckHintCards: function(typeid, nPower, nNum, aOriCards) {
    // 检验可以出的手牌
    var self = this;
    var aOriCards = aOriCards? aOriCards : [];
    if(typeof aOriCards != 'object' || !aOriCards.length){
      aOriCards = [];
    }
    var nPower = nPower || 0;
    var oCardVal = {};
    var aCardVal = [];
    var oCardNum = {
      '1': []
    , '2': []
    , '3': []
    , '4': []
    };
    for (var i = 0; i < aOriCards.length; i++) {
      var nCard = aOriCards[i];
      var nCardVal = self.fGetCardVal(nCard);
      !oCardVal[nCardVal] && (oCardVal[nCardVal] = []);
      oCardVal[nCardVal].push(nCard);
      aCardVal.indexOf(nCardVal) < 0 && aCardVal.push(nCardVal);
    }
    for (var i = 0; i < aCardVal.length; i++) {
      var nCardVal = aCardVal[i];
      var aCards = oCardVal[nCardVal];
      var nLen = aCards.length;
      oCardNum[nLen].push(nCardVal);
    }
    aCardVal = aCardVal.sort(CardControler.SORTASC);
    var oFunc = {
      '1': 'fGetOneTypeCards'
    , '2': 'fGetOneTypeCards'
    , '3': 'fGetOneTypeCards'
    , '4': 'fGetOneTypeCards'
    , '9': 'fGetJunkoCards'
    , '10': 'fGetJunkoCards'
    , '11': 'fGetJunkoCards'
    , '17': 'fGetRocketCards'
    , '18': 'fGetPlaneCards'
    , '19': 'fGetThreePlusCards'
    , '20': 'fGetFourPlusCards'
    }
    var aSameId = [CARDSTYPE.YI_ZHANG, CARDSTYPE.ER_ZHANG, CARDSTYPE.SAN_ZHANG, CARDSTYPE.SI_ZHANG];
    var aSpecId = [CARDSTYPE.HUO_JIAN, CARDSTYPE.FEI_JI, CARDSTYPE.SAN_DAI_YI, CARDSTYPE.SI_DAI_ER];
    var aJunkoId = [CARDSTYPE.YI_SHUN, CARDSTYPE.ER_SHUN, CARDSTYPE.SAN_SHUN];
    var aRet = [];
    if (aSameId.indexOf(+typeid) > -1) {
      var sFunc =oFunc[typeid];
      aRet = this[sFunc](oCardVal, aCardVal, oCardNum, nPower, typeid);
    }
    if (aJunkoId.indexOf(+typeid) > -1) {
      var nJunkoNum = aJunkoId.indexOf(+typeid) + 1;
      aRet = this.fGetJunkoCards(oCardVal, aCardVal, oCardNum, nPower, nJunkoNum, nNum);
    }
    if (aSpecId.indexOf(+typeid) > -1) {
      var sFunc = oFunc[typeid];
      aRet = this[sFunc](oCardVal, aCardVal, oCardNum, nPower, aOriCards, nNum);
    }
    return aRet;
  }
, fGetCardVal: function(nCard) {
    var a = nCard;
    var ans = a % 13 === 0? 13: a % 13;
    if (a >= 53) {
      ans = a - 31;
    }
    // A牌2牌
    if (ans === 1) {
      ans = 14;
    }
    if(ans === 2){
      ans = 19;
    }
    return ans;
  }
, fGetOneTypeCards: function(oCardVal, aCardVal, oCardNum, nPower, nNum) {
    // 获取单种牌 1、2、3、4张
    // 策略：恰好符合张数 > 按权重从小到大拆
    var ret = [];
    var nPower = nPower;
    var aCards = oCardNum[nNum].sort(CardControler.SORTASC);
    var aCardVal = aCardVal || []; // 手牌牌值升序排
    var tmpPvArr = this.fGetPerfectCards(aCards, nPower);
    // 如果没有匹配的就拆牌
    if (tmpPvArr.length == 0 && nNum < 3) {
      tmpPvArr = this.fGetGoodCards(aCardVal, oCardVal, nPower, nNum);
    }
    ret = this.fGetSolCards(tmpPvArr, oCardVal, nNum);
    return ret;
  }
, fGetJunkoCards: function(oCardVal, aCardVal, oCardNum, nPower, nJunkoNum, nLastCardsNum) {
    // 获取各种顺子牌
    // 策略： 根据比power大的牌 遍历 检测是否能生成顺子
    nPower = nPower || 0;
    aCardVal = aCardVal || []; // 手牌牌值升序排
    var ret = [];
    for (var i = 0; i < aCardVal.length; i++) {
      var tmpArr = [];
      var nCardVal = +aCardVal[i];
      var aCardList = oCardVal[nCardVal];
      var nLen = aCardList.length;
      var nStepNum = nLastCardsNum / nJunkoNum;
      if (nCardVal > nPower && nCardVal < 15 && nLen >= nJunkoNum) {
        for (var j = 0; j < nStepNum; j++) {
          var nNextCardVal = nCardVal - j;
          var aNextCardList = oCardVal[nNextCardVal];
          if (!aNextCardList || !aNextCardList.length || aNextCardList.length < nJunkoNum) {
            break;
          }
          var aList = aNextCardList.sort(CardControler.SORTASC);
          var sCards = aList.slice(0, nJunkoNum);
          tmpArr = tmpArr.concat(sCards);
        }
        if (tmpArr.length == nLastCardsNum) {
          ret.push(tmpArr);
        }
      }
    }
    return ret;
  }
, fGetRocketCards: function(oCardVal, aCardVal) {
    var ret = [];
    if (aCardVal.indexOf(22) > -1 && aCardVal.indexOf(23) > -1) {
      ret.push([54, 53]);
    }
    return ret;
  }
, fGetPlaneCards: function(oCardVal, aCardVal, oCardNum, nPower, aCards, nLastCardsNum) {
    var tmpRandArr = [];
    var nLastCardsNum = nLastCardsNum;
    var nRandNum = nLastCardsNum % 5 == 0 ? 2 : 1;
    var nLCN = nLastCardsNum / (3 + nRandNum);
    var tmpArr = this.fGetJunkoCards(oCardVal, aCardVal, oCardNum, nPower, 3, nLCN * 3);
    var ret = [];
    if(tmpArr.length > 0) {
      // 随机拿不一样的牌
      for (var i = 0; i < tmpArr.length; i++) {
        var aSelCards = tmpArr[i];
        tmpRandArr = [];
        var aRestCards = this.fGetRestCards(aCards, aSelCards);
        if (nRandNum == 1) {
          var aTmp = this.fGetRandSingleCard(oCardNum, aRestCards, nLCN);
          (aTmp.length * nRandNum) && (tmpRandArr = aTmp);
        }
        if (nRandNum == 2) {
          var aTmp = this.fGetRandDoubleCards(aRestCards, nLCN);
          (aTmp.length == nLCN * nRandNum) && (tmpRandArr = aTmp);
        }
        if (tmpRandArr.length == nRandNum * nLCN) {
          aSelCards = aSelCards.concat(tmpRandArr);
          ret.push(aSelCards);
        }
      }
    }
    return ret;
  }
, fGetThreePlusCards: function(oCardVal, aCardVal, oCardNum, nPower, aCards, nLastCardsNum) {
    var tmpArr = this.fGetOneTypeCards(oCardVal, aCardVal, oCardNum, nPower, 3);
    var tmpRandArr = [];
    var nLastCardsNum = nLastCardsNum;
    var nRandNum = nLastCardsNum % 5 == 0 ? 2 : 1;
    var ret = [];
    if(tmpArr.length > 0) {
      // 随机拿不一样的牌
      for (var i = 0; i < tmpArr.length; i++) {
        var aSelCards = tmpArr[i];
        tmpRandArr = [];
        var aRestCards = this.fGetRestCards(aCards, aSelCards);
        if (nRandNum == 1) {
          var aTmp = this.fGetRandSingleCard(oCardNum, aRestCards, 1);
          (aTmp.length == 1) && (tmpRandArr = aTmp);
        }
        if (nRandNum == 2) {
          var aTmp = this.fGetRandDoubleCards(aRestCards, 1);
          (aTmp.length == 2) && (tmpRandArr = aTmp);
        }
        if (tmpRandArr.length == nRandNum) {
          aSelCards = aSelCards.concat(tmpRandArr);
          ret.push(aSelCards);
        }
      }
    }
    return ret;
  }
, fGetFourPlusCards: function(oCardVal, aCardVal, oCardNum, nPower, aCards, nLastCardsNum) {
    var tmpArr = this.fGetOneTypeCards(oCardVal, aCardVal, oCardNum, nPower, 4);
    var tmpRandArr = [];
    var nLastCardsNum = nLastCardsNum;
    var ret = [];
    if(tmpArr.length > 0) {
      // 随机拿不一样的牌
      for (var i = 0; i < tmpArr.length; i++) {
        var aSelCards = tmpArr[i];
        tmpRandArr = [];
        var aRestCards = this.fGetRestCards(aCards, aSelCards);
        var aTmp = this.fGetRandSingleCard(oCardNum, aRestCards, 2);
        (aTmp.length == 2) && (tmpRandArr = aTmp);
        if (tmpRandArr.length == 2) {
          aSelCards = aSelCards.concat(tmpRandArr);
          ret.push(aSelCards);
        }
      }
    }
    return ret;
  }
, fGetRestCards: function(aOriCards, aSelCards) {
    var aCards = [];
    var aSelCards = aSelCards || [];
    for (var i = 0; i < aOriCards.length; i ++) {
      var nCurCards = aOriCards[i];
      (aSelCards.indexOf(nCurCards) < 0 || aSelCards.indexOf(+nCurCards) < 0) && aCards.push(nCurCards);
    }
    return aCards;
  }
, fGetRandSingleCard: function (oCardNum, aRestCards, nRandNum) {
    var aCardNum = oCardNum['1'] || oCardNum[1] ||[];
    if (aCardNum.length >= nRandNum) {
      var tmpArr = this.fCheckHintCards(CARDSTYPE.YI_ZHANG, 0, 1, aRestCards);
      var ret = [];
      for (var i = 0; i < nRandNum; i++) {
        tmpArr[i] && (ret = ret.concat(tmpArr[i]));
      }
    } else {
      var tmpDblArr = this.fCheckHintCards(CARDSTYPE.ER_ZHANG, 0, 2, aRestCards);
      if (tmpDblArr.length > 0) {
        ret = nRandNum == 2 ? tmpDblArr[0] : [tmpDblArr[0][0]];
      } else {
        ret = [];
      }
    }
    return ret;
  }
, fGetRandDoubleCards: function (aRestCards, nRandNum) {
    var tmpArr = this.fCheckHintCards(CARDSTYPE.ER_ZHANG, 0, 2, aRestCards);
    var ret = [];
    for (var i = 0; i < nRandNum; i++) {
      tmpArr[i] && (ret = ret.concat(tmpArr[i]));
    }
    return ret;
  }
, fGetPerfectCards: function (aCards, nPower) {
    // 获取牌数恰好符合的牌
    nPower = nPower || 0;
    aCards = aCards || [];
    var tmpPvArr = [];
    if (aCards.length > 0) {
      var aPks = aCards.sort(CardControler.SORTASC); // 牌值升序排
      for (var i = 0; i < aPks.length; i++) {
        var nPv = aPks[i];
        nPv > nPower && !(aPks.indexOf(22) > -1 && aPks.indexOf(23) > -1 && nPv > 19) && tmpPvArr.push(nPv);
      }
    }
    return tmpPvArr;
  }
, fGetGoodCards: function(aCardVal, oCardVal, nPower, nNum) {
    // 按权重从小到大拆牌结果 不拆炸弹
    var nPower = nPower;
    aCardVal = aCardVal || []; // 手牌牌值升序排
    oCardVal = oCardVal || {};
    var tmpPvArr = [];
    var tmpBombArr = [];
    aCardVal = aCardVal.sort(CardControler.SORTASC); // 牌值升序排
    for (var i = 0; i < aCardVal.length; i++) {
      var nCardVal = aCardVal[i];
      var aCardList = oCardVal[nCardVal];
      if (nCardVal > nPower && aCardList.length > nNum && aCardList.length < 4) {
        tmpPvArr.push(nCardVal);
      }
    }
    return tmpPvArr;
  }
, fGetSolCards: function(tmpPvArr, oCardVal, nNum) {
    var ret = [];
    var nNum = nNum || 1;
    for (var i = 0; i < tmpPvArr.length; i++) {
      var nCardVal = tmpPvArr[i];
      var aCardList = oCardVal[nCardVal].sort(CardControler.SORTASC);
      var sCards = aCardList.slice(0, nNum);
      ret.push(sCards);
    }
    return ret;
  }
}

export {CardHelper};