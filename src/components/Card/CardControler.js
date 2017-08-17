//牌型
import {CARDSTYPE} from './CARDSTYPE.js';
import {CardHelper} from './CardHelper.js';

var CardControler = {
  fGetCardsPower: function (aCards) {
    var self = this;
    var nRet = 0;
    var oRet = self.fGetCardsNumObj(aCards);
    var oCardsNum = oRet['oCardsNum'];
    for (var i = 4; i > 0; i--) {
      var maxArr = oCardsNum[i];
      if (maxArr.length > 0) {
        nRet = Math.max.apply({}, maxArr);
        break;
      }
    }
    return nRet;
  }

, fSortHandCards: function(aCards) {
    var self = this;
    var oRet = self.fGetCardsValObj(aCards);
    var aCardsVal = oRet['aCardsVal'].sort(self.SORTDESC);
    var oCardsVal = oRet['oCardsVal'];
    var aSortedCards = [];
    for (var i = 0; i < aCardsVal.length; i++) {
      var nCardVal = aCardsVal[i];
      var aTmpCards = oCardsVal[nCardVal].sort(self.SORTDESC);
      aSortedCards = aSortedCards.concat(aTmpCards);
    }
    return aSortedCards;
  }

, fSortOutCards: function(aCards) {
    var self = this;
    var oRet = self.fGetCardsNumObj(aCards);
    var oCardsNum = oRet['oCardsNum'];
    var oCardsVal = oRet['oCardsVal'];
    var aSortedCards = [];
    for (var i = 4; i > 0; i--) {
      var aTmpCardsVal = oCardsNum[i].sort(self.SORTDESC);
      for (var j = 0; j < aTmpCardsVal.length; j++) {
        var nCardVal = aTmpCardsVal[j];
        var aTmpCards = oCardsVal[nCardVal].sort(self.SORTDESC);
        aSortedCards = aSortedCards.concat(aTmpCards);
      }
    }
    return aSortedCards;
  }

, oJudgeCardsFuncList: {
    'fJudgeSingle': CARDSTYPE.YI_ZHANG
  , 'fJudgeDouble': CARDSTYPE.ER_ZHANG
  , 'fJudgeTriple': CARDSTYPE.SAN_ZHANG
  , 'fJudgeBomb': CARDSTYPE.SI_ZHANG
  , 'fJudgeSingleJunko': CARDSTYPE.YI_SHUN
  , 'fJudgeDoubleJunko': CARDSTYPE.ER_SHUN
  , 'fJudgeTripleJunko': CARDSTYPE.SAN_SHUN
  , 'fJudgeRocket':  CARDSTYPE.HUO_JIAN
  , 'fJudgePlane': CARDSTYPE.FEI_JI
  , 'fJudgeTriplePlus':  CARDSTYPE.SAN_DAI_YI
  , 'fJudgeFourPlusTwo':  CARDSTYPE.SI_DAI_ER
}
, fGetCardsType: function(aCards) {
    var self = this;
    var oCheckList = this.oJudgeCardsFuncList;
    var nType = 0;
    var oRet = self.fGetCardsNumObj(aCards);
    var oCardsNum = oRet['oCardsNum'];
    var nLen = aCards.length;
    for (var key in oCheckList) {
      var nNum = oCheckList[key];
      var bJudge = self[key](nLen, oCardsNum);
      if (bJudge) {
        nType = nNum;
        break;
      }
    }
    return nType;
  }

  // 检测是否有顺子
, fGetAutoJunkoCards: function(aPokers, maxVal) {
    // 按照三顺、二顺、单顺下来
    var ret = [];
    var power = maxVal - 1;
    if (aPokers.length > 4) {
      // 三顺
      var tmp = 18;
      while (tmp > 8) {
        var t = CardHelper.fCheckHintCards(CARDSTYPE.SAN_SHUN, power, tmp, aPokers);
        if (t.length > 0) {
          ret = t[0];
          break;
        }
        tmp -= 3;
      }
      if(ret.length == 0) {
        // 二顺
        var tmp = 20;
        while (tmp > 5) {
          var t = CardHelper.fCheckHintCards(CARDSTYPE.ER_SHUN, power, tmp, aPokers);
          if (t.length > 0) {
            ret = t[0];
            break;
          }
          tmp -= 2;
        }
      }
      if(ret.length == 0) {
        // 1顺
        var tmp = 20;
        while (tmp > 4) {
          var t = CardHelper.fCheckHintCards(CARDSTYPE.YI_SHUN, power, tmp, aPokers);
          if (t.length > 0) {
            ret = t[0];
            break;
          }
          tmp -= 1;
        }
      }
    }
    return ret;
  }

, fTouchCards: function(aSelCards, aMyCards, aSelfUpCards, oLastOut) {
    var self = this;
    var oMyCardList = {};
    var cards = [];
    // 将手上有哪些手牌理清
    for (var i = 0; i < aMyCards.length; i++) {
      var pk = aMyCards[i];
      var pv = self.fGetCardVal(pk);
      if(!oMyCardList[pv]){
        oMyCardList[pv] = [];
        cards.push(pv);
      }
      oMyCardList[pv].push(pk);
    }
    var lastPower = 0;
    var lastPokers = [];
    var lastCount = 0;
    var lastType = 0;
    if (oLastOut) {
      lastPokers = oLastOut['aCards'] || [];
      lastPower = oLastOut['nPower'] || 0;
      lastCount = lastPokers.length || 0;
      lastType = oLastOut['nType'] || 0;
    }
    var aPrepareOut = []; // 假设欲出的牌
    var oldValList = [];
    var tmpPokerVal = {};
    if (aSelCards.length == 1) {
      // 单选
      if (aSelfUpCards.length == 0) {
        // 选第一张牌时
        var spoker = aSelCards[0];
        var spv = self.fGetCardVal(spoker);
        var plen = oMyCardList[spv].length;
        if(plen == 2 && lastPokers.length == 0) {
        } else if (lastPokers.length != 0) {
          // 如果是跟牌的话 判断选中的牌是不是跟之前的符合
          var lptype = lastType;
          if(lptype == CARDSTYPE.ER_SHUN || lptype == CARDSTYPE.SAN_SHUN) {
            // 双顺或者三顺时看作两张或三张处理
            lptype = lptype - (CARDSTYPE.YI_SHUN  - 1);
          }
          if (lptype > 1 && lptype < 5) {
            // 上家出了2-4张
            if(plen == lptype) {
              // 选中的牌恰好满足时自动升起
              for(var i = 0; i < oMyCardList[spv].length; i++) {
                aPrepareOut.push(oMyCardList[spv][i]);
              }
            }
          } else if (lptype == CARDSTYPE.SAN_DAI_YI) {
            // 三带一或者三带二的情况下
            if(plen == 3) {
              for(var i = 0; i < oMyCardList[spv].length; i++) {
                aPrepareOut.push(oMyCardList[spv][i]);
              }
            }
            if(plen == 2 && lastCount == 5) {
              // 三带二时 二也自动升起
              for(var i = 0; i < oMyCardList[spv].length; i++) {
                aPrepareOut.push(oMyCardList[spv][i]);
              }
            }
          }
        }
      } else {
        // 选后面几张牌时, 先理清已经选了哪些牌
        for (var i = 0; i < aSelfUpCards.length; i++) {
          var pk = aSelfUpCards[i];
          var pv = self.fGetCardVal(pk);
          if(!tmpPokerVal[pv]){
            tmpPokerVal[pv] = [];
            oldValList.push(pv);
          }
          tmpPokerVal[pv].push(pk);
        }

        var spoker = aSelCards[0];
        var spv = self.fGetCardVal(spoker);
        var plen = oMyCardList[spv].length;
        var lptype = lastType;
        // 之前只选了1种牌的一张，如果这次选的和之前的一样,且分别是头尾时并且有>2张时，升起全部
        if(oldValList.length == 1 && aSelfUpCards.length == 1  && spoker != aSelfUpCards[0] && spv == oldValList[0] && plen > 2) {
          // A > B 判断AB是否分别是这个牌值的最大值和最小值
          var tmpA = aSelfUpCards[0] > spoker ? aSelfUpCards[0] : spoker;
          var tmpB = tmpA == aSelfUpCards[0] ? spoker : aSelfUpCards[0];
          if(tmpA == Math.max.apply({}, oMyCardList[spv]) &&  tmpB == Math.min.apply({}, oMyCardList[spv])) {
            for(var i = 0; i < oMyCardList[spv].length; i++) {
              var p = oMyCardList[spv][i];
              aPrepareOut.push(p);
            }
          }
        }
        // 之前只选了一种牌，且张数小于3，和这次选的不一样，此时判断是否存在三顺、二顺、单顺
        // 20150707 只有上家出的不是飞机、三带一、四带二牌才找
        var aCheckList = [CARDSTYPE.FEI_JI, CARDSTYPE.SAN_DAI_YI, CARDSTYPE.SI_DAI_ER];
        if(aCheckList.indexOf(+lptype) < 0 && oldValList.length == 1 && aSelfUpCards.length < 3 &&  spv != oldValList[0]) {
          // 先拿到较大的牌型
          var maxVal = spv > oldValList[0] ? spv : oldValList[0];
          var minVal = maxVal == spv ? oldValList[0] : spv;
          var aTmpPokers = [];
          // 拿到区间内所有的手牌
          for (var i = minVal; i <= maxVal; i++) {
            if(oMyCardList[i] && oMyCardList[i].length != 0) {
              for (var j = 0; j < oMyCardList[i].length; j++) {
                aTmpPokers.push(oMyCardList[i][j]);
              }
            }
          }
          var ret = [];
          if (lastPokers.length != 0) {
            // 跟牌情况下
            var lptype = lastType;
            if(lptype == CARDSTYPE.YI_SHUN || lptype == CARDSTYPE.ER_SHUN || lptype == CARDSTYPE.SAN_SHUN) {
              // 此时判断是不是有符合条件的顺子
              var power = lastPower;
              ret = CardHelper.fCheckHintCards(lptype, power, lastCount, aTmpPokers);
              ret = ret.length > 0 ? ret[0] : [];
            }
          } else {
            // 自己首出牌，检测是否有三顺、二顺、单顺（边界必须是选的手牌）
            ret = self.fGetAutoJunkoCards(aTmpPokers, maxVal);
          }
          if(ret.length > 0) {
            // 存在顺子就升起顺子牌 (要先降下对牌)
            for(var i = 0; i < ret.length; i++) {
              var p = ret[i];
              aPrepareOut.push(p);
            }
          }
        }
        // 跟牌时 3带1 3带2 的情况
        if (lastPokers.length == 4 || lastPokers.length == 5) {
          if (lptype == CARDSTYPE.SAN_DAI_YI) {
            if(plen == 3 && aSelfUpCards.length < 3) {
              // 三带的情况下，要选三张
              for(var i = 0; i < oMyCardList[spv].length; i++) {
                aPrepareOut.push(oMyCardList[spv][i]);
              }
            } else if(plen == 2 && lastCount == 5 &&  aSelfUpCards.length == 3) {
              // 三带二时 二也自动升起
              aPrepareOut = aSelfUpCards.concat(); // 2015.6.12 解决三带二时选2把3放下去的问题 2015.7.7 解决三带二时判断不准确的问题
              for(var i = 0; i < oMyCardList[spv].length; i++) {
                aPrepareOut.push(oMyCardList[spv][i]);
              }
            }
          }
        }
      }
    } else {
      // 一次滑多张牌
      if (aSelCards.length > 4) {
        // 滑动张数大于4时判断顺子
        var aDesc = self.fSortHandCards(aSelCards);
        var maxPoker = aDesc[0];
        var minPoker = aDesc[aDesc.length - 1];
        var maxVal = self.fGetCardVal(maxPoker);
        var minVal = self.fGetCardVal(minPoker);
        var aTmpPokers = [];
        for (var i = 0; i < aSelCards.length; i++) {
          aTmpPokers.push(aSelCards[i]);
        }
        var ret = [];
        if (lastPokers.length != 0) {
          // 跟牌情况下
          var lptype = lastType;
          if(lptype == CARDSTYPE.YI_SHUN || lptype == CARDSTYPE.ER_SHUN || lptype == CARDSTYPE.SAN_SHUN) {
            // 此时判断是不是有符合条件的顺子
            var power = lastPower;
            ret = CardHelper.fCheckHintCards(lptype, power, lastCount, aTmpPokers);
            ret = ret.length > 0 ? ret[0] : [];
          }
        } else {
          // 自己首出牌，检测是否有三顺、二顺、单顺（边界必须是选的手牌）
          // 20150710 只有上家出的不是飞机、三带一、四带二牌才找
          var aCheckList = [CARDSTYPE.FEI_JI, CARDSTYPE.SAN_DAI_YI, CARDSTYPE.SI_DAI_ER];
          var nPokerType = self.fGetCardsType(aTmpPokers);
          if (aCheckList.indexOf(+nPokerType) < 0) {
            ret = self.fGetAutoJunkoCards(aTmpPokers, maxVal);
          }
        }
        if (ret.length > 0) {
          // 有顺子
          aPrepareOut = ret;
        }
      }
    }

    // 判断是不是有智能出牌 有的话按智能的来，没有的话就处理选中的牌
    var nPlanLen = aPrepareOut.length;
    var nUpCardsNum = aSelfUpCards.length;
    var nSelLen = aSelCards.length;
    if (nPlanLen == 0) {
      var bAllInUpCards = true; // 检测选中的牌是不都升起了
      for (var i = 0; i < nSelLen; i++) {
        var nCard = aSelCards[i];
        if (aSelfUpCards.indexOf(nCard) < 0) {
          bAllInUpCards = false;
          break;
        }
      }
      for (var i = 0; i < nSelLen; i++) {
        var nCard = aSelCards[i];
        var idx = aSelfUpCards.indexOf(nCard);
        if (idx > -1) {
          // 本次选中的牌都已经升起过,并且只选中其中一部分的 就都降下
          bAllInUpCards && nSelLen <= nUpCardsNum && aSelfUpCards.splice(idx, 1);
        } else {
          // 未升起就升起
          aSelfUpCards.push(nCard)
        }
      }
      return aSelfUpCards;
    } else {
      // 有智能出牌
      var bAllTheSame = true;
      for (var i = 0; i < nPlanLen; i++) {
        var nPlanCard = aPrepareOut[i];
        if (aSelfUpCards.indexOf(nPlanCard) < 0) {
          bAllTheSame = false;
          break;
        }
      }
      if (nUpCardsNum == nPlanLen && bAllTheSame) {
        // 如果两次智能出牌一致，则降下
        aPrepareOut = [];
      }
      return aPrepareOut;
    }
  }

, fGetCardsNumObj: function(aCards) {
    var self = this;
    var oRet = self.fGetCardsValObj(aCards);
    var aCardsVal = oRet['aCardsVal'].sort(self.SORTDESC);
    var oCardsVal = oRet['oCardsVal'];
    var aCards = aCards || [];
    var oCardsNum = {4: [], 3: [], 2:[], 1:[]};
    for (var i = 0; i < aCardsVal.length; i++) {
      var nCardVal = aCardsVal[i];
      var num = oCardsVal[nCardVal].length;
      oCardsNum[num].push(nCardVal);
    }
    var oRet = {
      'oCardsVal': oCardsVal
    , 'aCardsVal': aCardsVal
    , 'oCardsNum': oCardsNum
    };
    return oRet;
  }

, fGetCardVal: function(cardId) {
    var nCardVal = cardId % 13 === 0 ? 13 : cardId % 13;
    if (cardId >= 53) {
      nCardVal = cardId - 31;
    }
    if (nCardVal === 1) {
      nCardVal = 14;
    }
    if(nCardVal === 2){
      nCardVal = 19;
    }
    return nCardVal;
  }
, fGetCardsValObj: function(aCards) {
    var self = this;
    var oCardsVal = {};
    var aCardsVal = [];
    var aCards = aCards || [];
    for(var i = 0; i < aCards.length; i++){
      var cardId = aCards[i];
      var nCardVal = self.fGetCardVal(cardId);
      if (!oCardsVal[nCardVal]) {
        oCardsVal[nCardVal] = [cardId];
        aCardsVal.push(nCardVal);
      } else {
        oCardsVal[nCardVal].push(cardId);
      }
    }
    var oRet = {
      'oCardsVal': oCardsVal
    , 'aCardsVal': aCardsVal
    };
    return oRet;
  }

, fJudgeSingle: function(nLen, oCardsNum) {
    var ret = nLen == 1 ? true : false;
    return ret;
  }
, fJudgeDouble: function(nLen, oCardsNum) {
    var ret = (nLen == 2) && oCardsNum['2'].length == 1 ? true : false;
    return ret;
  }
, fJudgeTriple: function(nLen, oCardsNum) {
    var ret = (nLen == 3) && oCardsNum['3'].length == 1 ? true : false;
    return ret;
  }
, fJudgeBomb: function(nLen, oCardsNum) {
    var ret = (nLen == 4) && oCardsNum['4'].length == 1 ? true : false;
    return ret;
  }
, fJudgeSingleJunko: function(nLen, oCardsNum) {
    var self = this;
    if (nLen < 5 || oCardsNum['1'].length < 5 || oCardsNum['1'].length != nLen) {
      return false;
    }
    var aTmpCardsVal = oCardsNum['1'].sort(self.SORTASC);
    for (var i = 1; i < aTmpCardsVal.length; i ++) {
      var nCardVal = aTmpCardsVal[i];
      var nLast = i - 1;
      var nLastCardVal = aTmpCardsVal[nLast];
      if ((nCardVal - nLastCardVal) != 1) {
        return false;
      }
    }
    return true;
  }
, fJudgeDoubleJunko: function(nLen, oCardsNum) {
    var self = this;
    if (nLen < 6 || oCardsNum['2'].length < 3 || oCardsNum['2'].length * 2 != nLen) {
      return false;
    }
    var aTmpCardsVal = oCardsNum['2'].sort(self.SORTASC);
    for (var i = 1; i < aTmpCardsVal.length; i ++) {
      var nCardVal = aTmpCardsVal[i];
      var nLast = i - 1;
      var nLastCardVal = aTmpCardsVal[nLast];
      if ((nCardVal - nLastCardVal) != 1) {
        return false;
      }
    }
    return true;
  }
, fJudgeTripleJunko: function(nLen, oCardsNum) {
    var self = this;
    if (nLen < 6 || oCardsNum['3'].length < 2 || oCardsNum['3'].length * 3 != nLen) {
      return false;
    }
    var aTmpCardsVal = oCardsNum['3'].sort(self.SORTASC);
    for (var i = 1; i < aTmpCardsVal.length; i ++) {
      var nCardVal = aTmpCardsVal[i];
      var nLast = i - 1;
      var nLastCardVal = aTmpCardsVal[nLast];
      if ((nCardVal - nLastCardVal) != 1) {
        return false;
      }
    }
    return true;
  }
, fJudgeRocket: function(nLen, oCardsNum) {
    var self = this;
    if (nLen != 2 || oCardsNum['1'].length != 2 || oCardsNum['1'].indexOf(22) < 0 || oCardsNum['1'].indexOf(23) < 0) {
      return false;
    }
    return true;
  }
, fJudgePlane: function(nLen, oCardsNum) {
    var self = this;
    var bTriple = true;
    var bOther = false;
    if (nLen < 8 || oCardsNum['3'].length < 2) {
      return false;
    }
    var nTripleNum = oCardsNum['3'].length;
    var aTmpCardsVal = oCardsNum['3'].sort(self.SORTASC);
    var aPlane = [];
    for (var j = 0; j < aTmpCardsVal.length; j++) {
      var nStartNum = aTmpCardsVal[j];
      aPlane = [];
      aPlane.push(nStartNum)
      var nNext = j + 1;
      for (var i = nNext; i < aTmpCardsVal.length; i ++) {
        var nCardVal = aTmpCardsVal[i];
        var nLast = i - 1;
        var nLastCardVal = aTmpCardsVal[nLast];
        if ((nCardVal - nLastCardVal) != 1) {
          break;
        } else {
          aPlane.push(nCardVal);
        }
      }
      if (aPlane.length >= 2) {
        bTriple = true;
        nRest = nLen - aPlane.length * 3;
        if (nRest == aPlane.length || nRest == 2 * aPlane.length) {
          bOther = true;
        }
        if (bTriple && bOther) {
          break;
        }
      }
    }
    var ret = bTriple && bOther;
    return ret;
  }
, fJudgeTriplePlus: function(nLen, oCardsNum) {
    var self = this;
    var bTriple = true;
    var bOther = false;
    if (nLen < 4 || nLen > 5 || oCardsNum['3'].length != 1) {
      return false;
    }
    var nDoubleNum = oCardsNum['2'].length;
    var nSingleNum = oCardsNum['1'].length;
    if (1 == nDoubleNum && 5 == nLen) {
      bOther = true;
    }
    if (nSingleNum == 1 && 4 == nLen) {
      bOther = true;
    }
    var ret = bTriple && bOther;
    return ret;
  }
, fJudgeFourPlusTwo: function(nLen, oCardsNum) {
    var self = this;
    if (oCardsNum['4'].length != 1) {
      return false;
    }
    if (nLen == 6  || nLen == 8) {
      return true;
    }
    return false;
  }

, SORTASC: function(a, b) {
    return a - b;
  }

, SORTDESC: function(a, b) {
    return b - a;
  }
};

export {CardControler};