<template>
  <div class="result-container">
    <div class="result-info">
      <h2>游戏结束</h2>
      <div class="base-type">获胜方：{{sWinner}}</div>
      <div class="base-score">身份：{{sWinnerType}}</div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'resultLayer',
  components: {
  },
  props: ['sWinner', 'sWinnerType'],
  data () {
    return {
    }
  },
  filters: {
  },
  methods: {
  }
}
</script>
