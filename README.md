# 基于VUE的斗地主游戏

> 基于官方脚手架搭建，主要开发的精力集中在游戏算法和逻辑的实现
> 目前实现了二人斗地主的游戏逻辑与界面

## 功能

- [x] 粗暴的界面布局
- [x] 游戏逻辑
- [x] 随机发牌
- [x] 智能出牌
- [x] 基于智能出牌实现自动牌局
- [x] 游戏结算
- [ ] 游戏操作菜单（如“抢地主”、“出牌”、“不出”等操作）
- [ ] 玩家自主选牌
- [ ] 游戏倒计时
- [ ] 特殊牌型动效

## 简介

1.这个项目主要是想利用vue的优点，快速搭建游戏的可视化界面，方便调试和优化斗地主的智能选牌、出牌及游戏过程的相关算法。顺便学习和梳理一下VUE的一些知识点。

2.项目的核心思路就是用一个`GameServer`模块充当逻辑层来处理游戏数据与逻辑，然后通过`发布/订阅`模式或其它方法与游戏表现层进行数据交互。使逻辑层与表现层分离，这样就可以灵活的改变表现层的实现方案，既可以是canvas/webgl，也可以是dom。
在该项目中，我的方案是将游戏逻辑层处理好的数据注入到游戏主组件的data中，通过主组件向各个子组件进行分发，实现整个游戏的界面展示功能。


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
