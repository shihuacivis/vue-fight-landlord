
import {CARDSTYPE} from './CARDSTYPE.js';
import {CardControler} from './CardControler.js';
import {CardHelper} from './CardHelper.js';


var PLAYER_STATUS_NONE = 0;       // 空
var PLAYER_STATUS_WAIT = 1;       // 等待(按下开始按钮前)
var PLAYER_STATUS_READY = 2;      // 准备(按下开始按钮后)
var PLAYER_STATUS_PLAYING = 3;    // 游戏(正在进行游戏)
var PLAYER_STATUS_ESCAPE = 4;     // 逃跑(游戏被中断)
var PLAYER_STATUS_EXITEARLY = 5;  // 提前退出


var POWER_NONE = 0; //不能操作
var POWER_CALL_BANKER = 1; // 叫地主
var POWER_ROB_BANKER = 2; // 抢地主
var POWER_PLAY_CARD = 3; // 出牌


var aAllCards = [];
var bNoCall = false;
var aRobNum = [0, 0];

var nCallMult = 1;
var nRobMult = 1;
var nBaseMult = 1;
var nBombMult = 1;
var nSpringMult = 1;
var nWhoFirst = 0;
var timerGame = null;

var oGameData = {
  bStartGame: false,
  nSelfSeat: 0,
  nAgaSeat: 1,
  nBankerSeat: -1,
  aSelfCards: [],
  aAgaCards: [],
  aMult: [1, 1, 1, 1, 1],
  nMing: 0, // 明牌
  nSpread: 0, // 让分
  nBaseScore: 10,
  sBaseCardsType: '',
  aBaseCards: [],
  oCallLandlord: {
    nSeat: -1,
    nStep: 0,
    bPower: false
  },
  oLastOut: {
    nSeat: -1,
    aCards: [],
    nPower: 0,
    nType: 0
  },
  oResult: {
    sWinner: '',
    sPlayerType: ''
  }

};




//生成手牌
for (var i = 1; i < 55; i ++) {
  i % 13 != 3 && i % 13 != 4 && aAllCards.push(i);
};



function startGame () {

  clearTimeout(timerGame);
  timerGame = null;

  bNoCall = false;
  aRobNum = [0, 0];

  nCallMult = 1;
  nRobMult = 1;
  nBaseMult = 1;
  nBombMult = 1;
  nSpringMult = 1;
  nWhoFirst = 0;

  oGameData.bStartGame = true;
  oGameData.nSelfSeat =  0;
  oGameData.nAgaSeat =  1;
  oGameData.nBankerSeat =  -1;
  oGameData.aSelfCards =  [];
  oGameData.aAgaCards =  [];
  oGameData.aMult =  [1, 1, 1, 1, 1];
  oGameData.nMing =  0; // 明牌
  oGameData.nSpread =  0; // 让分
  oGameData.nBaseScore =  10;
  oGameData.sBaseCardsType =  '';
  oGameData.aBaseCards =  [];
  oGameData.oCallLandlord = {
    nSeat: -1,
    nStep: 0,
    bPower: false
  };
  oGameData.oLastOut = {
    nSeat: -1,
    aCards: [],
    nPower: 0,
    nType: 0
  }
  oGameData.oResult = {
    sWinner: '',
    sPlayerType: ''
  }


  console.log('点击开始游戏');


  // 发牌
  var oCards = getPlayCards(aAllCards);


  oGameData.aSelfCards = CardControler.fSortHandCards(oCards.aSelfCards);
  oGameData.aAgaCards = CardControler.fSortHandCards(oCards.aAgaCards);
  oGameData.aBaseCards = oCards.aBaseCards;
  oGameData.sBaseCardsType = oCards.sBaseCardsType;
  oGameData.nBaseMult = oCards.nBaseMult;
  oGameData.nMing = oCards.nMing;
  console.info(oGameData.sBaseCardsType);


  // 底分
  console.log('====游戏底分====');
  console.log('游戏底分：', oGameData.nBaseScore);

  // 倍数 叫地主 抢地主 底牌 炸弹 春天
  console.log('====游戏倍数====');
  console.log('游戏倍数：', nCallMult * nRobMult * nBaseMult * nBombMult * nSpringMult);
  oGameData.aMult = [nCallMult ,nRobMult ,nBaseMult ,nBombMult ,nSpringMult];

  // 开始发牌
  console.log('====发牌====');
  console.log('%c我方:' + JSON.stringify(oGameData.aSelfCards), 'color:green');
  console.log('%c对方:' + JSON.stringify(oGameData.aAgaCards), 'color:blue');
  console.log('明牌在：' + (nWhoFirst == oGameData.nSelfSeat ? '我方' : '对方') + ',' + oGameData.nMing);
  console.log('底牌:' + JSON.stringify(oGameData.aBaseCards));



  timerGame = setTimeout(function(){
    handleMsgPower({nSeat: nWhoFirst, nPower: POWER_CALL_BANKER, nTime: 30});
  }, 3000);

};




// 第2步 响应叫地主
function handleCallBanker(oData) {
  var nSeat = oData.nSeat;
  var bPower = oData.bPower;

  console.log('====叫地主====');
  console.log(nSeat == oGameData.nSelfSeat ? '我方' : '对方', bPower ? '叫地主' : '不叫');
  oGameData.oCallLandlord = {
    nSeat: nSeat,
    nStep: 0,
    bPower: bPower
  };
  // oGameData.nSpread = bPower ? (oGameData.nSpread + 1) : oGameData.nSpread;

  if (bNoCall) {
    // 下家叫时成为地主，双方都不叫时，默认起始玩家成为地主
    oGameData.nBankerSeat = bPower ? nSeat : nWhoFirst;
    handleMsgPower({nSeat: oGameData.nBankerSeat, nPower: POWER_PLAY_CARD, nTime: 30});
    return;
  }

  // 赋予下家抢/叫地主权限
  var nNext = nSeat == oGameData.nAgaSeat ? oGameData.nSelfSeat : oGameData.nAgaSeat;
  var nPower = bPower ? POWER_ROB_BANKER : POWER_CALL_BANKER; // 如果上家不叫 则询问下家叫不叫
  handleMsgPower({nSeat: nNext, nPower: nPower, nTime: 30});
  bNoCall = !bPower;
};

// 第3步 抢地主
function handleRobBanker(oData) {
  var nSeat = oData.nSeat;
  var bPower = oData.bPower;
  console.log('====抢地主====');
  console.log(nSeat == oGameData.nSelfSeat ? '我方' : '对方', bPower ? '抢地主' : '不抢');
  oGameData.nSpread = bPower ? (oGameData.nSpread + 1) : oGameData.nSpread;
  oGameData.oCallLandlord = {
    nSeat: nSeat,
    nStep: 1,
    bPower: bPower
  };
  if (bPower) {
    nRobMult = nRobMult * 2;
    console.log('====游戏倍数====');
    console.log('游戏倍数：', nCallMult * nRobMult * nBaseMult * nBombMult * nSpringMult);
    oGameData.aMult = [nCallMult ,nRobMult ,nBaseMult ,nBombMult ,nSpringMult];
  }


  if (bNoCall) {
    // 上家不叫，抢的人成为地主 不抢上家成为地主
    oGameData.nBankerSeat = bPower ? nSeat : (nSeat == oGameData.nSelfSeat ? oGameData.nAgaSeat : oGameData.nSelfSeat);
  } else if (!bNoCall && nSeat == nWhoFirst) {
    // 叫地主方操作
    if (bPower) {
      // 抢地主
      aRobNum[nSeat]++;
      if (aRobNum[nSeat] == 2) {
        oGameData.nBankerSeat = nSeat; // 抢两次成为地主
      } else {
        var nNext = nSeat == oGameData.nSelfSeat ? oGameData.nAgaSeat : oGameData.nSelfSeat;
        handleMsgPower({nSeat: nNext, nPower: POWER_ROB_BANKER, nTime: 30});
      }
    } else {
      // 不抢 下家成为地主
      var nNext = nSeat == oGameData.nSelfSeat ? oGameData.nAgaSeat : oGameData.nSelfSeat;
      oGameData.nBankerSeat = nNext;
    }
  } else if (!bNoCall && nSeat != nWhoFirst) {
    // 下家操作
    if (bPower) {
      // 抢地主
      aRobNum[nSeat]++;
      var nNext = nSeat == oGameData.nSelfSeat ? oGameData.nAgaSeat : oGameData.nSelfSeat;
      handleMsgPower({nSeat: nNext, nPower: POWER_ROB_BANKER, nTime: 30});
    } else {
      // 不抢 地主成为地主
      var nNext = nSeat == oGameData.nSelfSeat ? oGameData.nAgaSeat : oGameData.nSelfSeat;
      oGameData.nBankerSeat = nNext;
    }
  }

  if (oGameData.nBankerSeat == -1) {
    return;
  }
  oGameData.nBankerSeat == oGameData.nAgaSeat && (oGameData.aAgaCards = CardControler.fSortHandCards(oGameData.aAgaCards.concat(oGameData.aBaseCards)));
  oGameData.nBankerSeat == oGameData.nSelfSeat && (oGameData.aSelfCards = CardControler.fSortHandCards(oGameData.aSelfCards.concat(oGameData.aBaseCards)));
  console.log('====显示底牌====');
  console.log(JSON.stringify(oGameData.aBaseCards));
  console.log('====地主玩家====');
  console.log(oGameData.nBankerSeat == oGameData.nAgaSeat ? '对方' : '我方');
  console.log('====让牌数====');
  console.log(oGameData.nSpread);
  console.log('====当前手牌====');
  console.log('%c我方:' + JSON.stringify(oGameData.aSelfCards), 'color:green', oGameData.aSelfCards.length);
  console.log('%c对方:' + JSON.stringify(oGameData.aAgaCards), 'color:blue', oGameData.aAgaCards.length);
  handleMsgPower({nSeat: oGameData.nBankerSeat, nPower: POWER_PLAY_CARD, nTime: 30});
};

// 打牌
function handlePlayCards(oData) {
  oData.aCards = CardControler.fSortOutCards(oData.aCards);
  var nSeat = oData.nSeat;
  var aOut = oData.aCards.concat();
  var nOutCount = aOut.length;
  var nPower = CardControler.fGetCardsPower(aOut);
  var nType = CardControler.fGetCardsType(aOut);
  oGameData.oLastOut = {
    nSeat: nSeat,
    aCards: oData.aCards,
    nPower: nPower,
    nType: nType
  }
  var aHandCards = nSeat == oGameData.nSelfSeat ? oGameData.aSelfCards : oGameData.aAgaCards;
  while (aOut.length != 0) {
    var nCard = aOut[0];
    var i = aHandCards.indexOf(nCard);
    if (i  > -1) {
      aHandCards.splice(i, 1);
    }
    aOut.shift();
  }

  if (nType == CARDSTYPE.SI_ZHANG || nType == CARDSTYPE.HUO_JIAN) {
    nBombMult = nBombMult * 2;
    oGameData.aMult = [nCallMult ,nRobMult ,nBaseMult ,nBombMult ,nSpringMult];
  }

  console.log(oGameData.nSelfSeat == nSeat ? '%c====我方出牌====' : '%c====对方出牌====', oGameData.nSelfSeat == nSeat ? 'color:green' : 'color:blue');
  console.log(JSON.stringify(oGameData.oLastOut));

  if (checkGameOver()) {
    oGameData.bStartGame = false;
    return;
  }
  var nNext = nSeat == oGameData.nSelfSeat ? oGameData.nAgaSeat : oGameData.nSelfSeat;
  handleMsgPower({nSeat: nNext, nPower: POWER_PLAY_CARD, nTime: 30});
};

// 检测权限
function handleMsgPower(oData) {
  var nSeat = oData.nSeat;
  var nPower = oData.nPower;

  // if(nSeat == oGameData.nSelfSeat){
  //   return;
  // }

  if (nPower == POWER_PLAY_CARD) {
    // 模拟自动出牌
    var nLastSeat = oGameData.oLastOut.nSeat;
    var aHandCards = nSeat == oGameData.nSelfSeat ? oGameData.aSelfCards : oGameData.aAgaCards;
    var nLastPower = oGameData.oLastOut.nPower;
    var nLastType = oGameData.oLastOut.nType || 0;
    var nLastCount = oGameData.oLastOut.aCards.length;

    var oOutData = {
      nSeat: nSeat,
      aCards: [],
      nPower: 0,
      nType: 0
    }
    var aOut = [];
    if (nLastType == 0) {
      // 上家不出 自由出牌
      aAvail = CardHelper.fGetFreeCards(aHandCards);
      if (aAvail.length > 0) {
        // 有可出的牌
        aOut = aAvail[0];
      } else {
        var idx = aHandCards.length - 1;
        aOut = [aHandCards[idx]];
        // console.error('出牌逻辑有误')
      }
    } else {
      var aAvail = CardHelper.fGetAvailCards(nLastType, nLastPower, nLastCount, aHandCards);
      if (aAvail.length > 0) {
        // 有可出的牌
        aOut = aAvail[0];
      }
    }
    var nOutPower = CardControler.fGetCardsPower(aOut);
    var nOutType = CardControler.fGetCardsType(aOut);
    oOutData.aCards = aOut;
    oOutData.nPower = nOutPower;
    oOutData.nType = nOutType;

    timerGame = setTimeout(function(){
      handlePlayCards(oOutData);
    }, 500);
  } else if (nPower == POWER_CALL_BANKER) {
    // 叫地主模拟
    var bRandom = Math.random() > 0.01;
    timerGame = setTimeout(function(){
      handleCallBanker({nSeat: nSeat, bPower: bRandom});
    }, 500);
  } else if(nPower == POWER_ROB_BANKER) {
    // 抢地主模拟
    var bRandom = Math.random() > 0.01;
    timerGame = setTimeout(function(){
      handleRobBanker({nSeat: nSeat, bPower: bRandom});
    }, 500);
  }
};

function sortRand() {
  return Math.random() < 0.5;
}

 // 随机生成牌局的手牌和底牌
function getPlayCards(aCards) {
  var aSelfCards = [];
  var aAgaCards = [];
  var aBaseCards = [];
  var aRandCards = aCards.concat().sort(sortRand);
  // var aRandCards = [];
  // for (var i = 0; i < 34; i++) {
  //   var nRand = Math.floor(Math.random() * aCards.length);
  //   var nCard = aCards[nRand];
  //   aRandCards[i] = aCards.splice(nRand, 1)[0];
  // }
  var nMing = []// 明牌
  var nRand = Math.floor(Math.random() * 34);
  // 游戏权限 决定谁先叫地主
  nWhoFirst = nRand >= 17 ? oGameData.nAgaSeat : oGameData.nSelfSeat;
  // 拿到
  nMing = aRandCards[nRand];
  aSelfCards = aRandCards.splice(0, 17);
  aAgaCards = aRandCards.splice(0, 17);
  aBaseCards = aCards.splice(0, 3); // 底牌

  var oBaseCardsInfo = getBaseCardsInfo(aBaseCards);

  return {
    aSelfCards: aSelfCards,
    aAgaCards: aAgaCards,
    aBaseCards: aBaseCards,
    sBaseCardsType: oBaseCardsInfo.sBaseCardsType,
    nBaseMult: oBaseCardsInfo.nBaseMult,
    nMing: nMing
  };
};

function getBaseCardsInfo(aBaseCards) {
  //  单王（底牌中有一张大王或小王）：2倍
  //  对2（底牌中有两张2）:2倍
  //  顺子（底牌为三张点数相连的牌）：3倍
  //  同花顺（底牌为三张花色相同且牌点相连的牌）：3倍
  //  三条（底牌为三张牌点相同的牌）：3倍
  //  双王（底牌中有两张王）：4倍
  var nMult = 1;
  var sType = '普通';
  // 对2
  var oCardVal = {};
  var bDouble2 = false;
  var bTriple = false;
  var bJunko = false;
  var bSameTypeJunko = false;
  var aAsc = aBaseCards.sort(CardControler.SORTASC);
  var aCardsVal = [];
  for (var i = 0; i < aAsc.length; i++) {
    var nCard = aBaseCards[i];
    var nCardVal = CardControler.fGetCardVal(nCard);
    oCardVal[nCardVal] = oCardVal[nCardVal] ? (oCardVal[nCardVal] + 1) : 1;
    if (i == 2 && oCardVal[nCardVal] == 3) {
      bTriple = true;
    } else if (i == 2 && oCardVal['19'] == 2) {
      bDouble2 = true;
    }
    aCardsVal.push(nCardVal);
    if (i == 2 && (aCardsVal[0] + 1 == aCardsVal[1]) && (aCardsVal[1] + 1 == aCardsVal[2])) {
      // 顺子
      bJunko = true;
      if ((aAsc[0] + 1 == aAsc[1]) && (aAsc[1] + 1 == aAsc[2])) {
        // 同花顺
        bSameTypeJunko = true;
      }
    }
  };

  if (aBaseCards.indexOf(53) > -1 && aBaseCards.indexOf(54) > -1) {
    // 双王
    nMult = 4;
    sType = '双王';
  } else if (aBaseCards.indexOf(53) + aBaseCards.indexOf(54) >= -1) {
    // 单王
    nMult = 2;
    sType = '单王';
  } else if (bDouble2) {
    nMult = 2;
    sType = '对2';
  } else if (bTriple) {
    nMult = 3;
    sType = '三条';
  } else if (bJunko) {
    nMult = 3;
    sType = '顺子';
  } else if (bSameTypeJunko) {
    nMult = 3;
    sType = '同花顺';
  }

  return {
    nBaseMult: nMult,
    sBaseCardsType: sType
  };
};

function convertToCardsVal(aCards) {
  var arr = [], i = 0, len = aCards.length;
  for (i; i < len; i++) {
    var nCardVal = CardControler.fGetCardVal(aCards[i])
    if (nCardVal == 23) {
      nCardVal = 'BJ';
    }
    if (nCardVal == 22) {
      nCardVal = 'SJ';
    }
    if (nCardVal === 14) {
      nCardVal = 'A';
    }
    if(nCardVal == 19){
      nCardVal = 2;
    }
    if(nCardVal == 13){
      nCardVal = 'K';
    }
    if(nCardVal == 12){
      nCardVal = 'Q';
    }
    if(nCardVal == 11){
      nCardVal = 'J';
    }
    arr[i] = nCardVal;
  }
  return arr;
}

function getCardVal(nCard) {
  var nCardVal = CardControler.fGetCardVal(nCard)
  if (nCardVal == 23) {
    nCardVal = 'BJ';
  }
  if (nCardVal == 22) {
    nCardVal = 'SJ';
  }
  if (nCardVal === 14) {
    nCardVal = 'A';
  }
  if(nCardVal == 19){
    nCardVal = 2;
  }
  if(nCardVal == 13){
    nCardVal = 'K';
  }
  if(nCardVal == 12){
    nCardVal = 'Q';
  }
  if(nCardVal == 11){
    nCardVal = 'J';
  }
  return nCardVal;
}

function getCardType(nCard) {
  let nType = Math.floor((nCard - 1) / 13);
  return nType;
}
// 检测游戏是否结束
function checkGameOver() {
  var nSelfEnd = oGameData.nBankerSeat == oGameData.nSelfSeat ? 0 : oGameData.nSpread;
  var nAgaEnd =  oGameData.nBankerSeat == oGameData.nAgaSeat ? 0 : oGameData.nSpread;

  var bWin = false;

  var baseScore = oGameData.nBaseScore;


  if (oGameData.aSelfCards.length <= nSelfEnd) {
    // 我方获胜

    var nAgaFullCards = oGameData.nBankerSeat == oGameData.nSelfSeat ? 17 : 20;
    var bSpring = oGameData.aAgaCards.length == nAgaFullCards;
    if (bSpring) {
      nSpringMult = nSpringMult * 2;
      console.info('春天');
      oGameData.aMult = [nCallMult ,nRobMult ,nBaseMult ,nBombMult ,nSpringMult];
    }

    var rate = nCallMult * nRobMult * nBaseMult * nBombMult * nSpringMult;
    var nSelfScore =  baseScore * rate;
    var nAgaScore = baseScore * rate;

    bWin = true;
    nAgaScore = -nAgaScore;


    console.log('%c====结束====', 'color:green');
    console.log('%c我方获胜', 'color:green');
    console.log(oGameData.nBankerSeat == oGameData.nSelfSeat ? '地主' : '农民' + '获胜');
    var sWinner = '我方';
    var sWinnerType = oGameData.nBankerSeat == oGameData.nSelfSeat ? '地主' : '农民';
    oGameData.oResult = {
      sWinner: sWinner,
      sWinnerType: sWinnerType
    }
    return true;
  } else if (oGameData.aAgaCards.length <= nAgaEnd) {
    bWin = false;

    var nSelfFullCards = oGameData.nBankerSeat == oGameData.nSelfSeat ? 20 : 17;
    var bSpring = oGameData.aSelfCards.length == nSelfFullCards;
    if (bSpring) {
      nSpringMult = nSpringMult * 2;
      console.info('春天');
    }
    var rate = nCallMult * nRobMult * nBaseMult * nBombMult * nSpringMult;
    var nSelfScore =  baseScore * rate;
    var nAgaScore = baseScore * rate;

    nSelfScore = -nSelfScore;

    console.log('%c====结束====', 'color:blue');
    console.log('%c对方获胜', 'color:blue');
    console.log(oGameData.nBankerSeat == oGameData.nAgaSeat ? '地主' : '农民' + '获胜');
    var sWinner = '对方';
    var sWinnerType = oGameData.nBankerSeat == oGameData.nAgaSeat ? '地主' : '农民';
    oGameData.oResult = {
      sWinner: sWinner,
      sWinnerType: sWinnerType
    }
    return true;
  }

  return false;
};

var GameServer = {};
GameServer.startGame = startGame;
GameServer.getCardVal = getCardVal;
GameServer.getCardType = getCardType;

export {
  GameServer,
  oGameData
};