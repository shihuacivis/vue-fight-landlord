<template>
  <div class="handcards-container agacards-container">
    <div class="handcards">
      <div class="handcard" v-for="(oCard, index) in aCards">{{oCard}}</div>
    </div>
    <div class="outcards">
      <div class="outcard" v-for="(oCard, index) in aCards">{{oCard}}</div>
    </div>
  </div>
</template>

<script>
import './scss/cards-layer.scss';
export default {
  name: 'sagacardsLayer',
  props: ['aCards', 'aOutCards'],
  data () {
    return {
    }
  }
}
</script>
