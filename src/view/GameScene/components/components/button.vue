<template>
  <div class="button" :class="sBtnClass">
    <slot>按钮</slot>
  </div>
</template>

<script>
export default {
  name: 'button',
  props: ['nType'],
  data () {
    return {
    }
  },
  filters: {

  },
  computed: {
    sBtnClass() {
      let aSize = ['handcard', 'outcard'];
      return aSize[this.nType];
    }
  },
  methods: {
  }
}
</script>
