const HANDLER = '_vue_touchendouside_handler';
var sEvent = document.ontouchstart !== null ? 'mouseup' : 'touchend';
export default {
  /*
   @param el 指令所绑定的元素
   @param binding {Object}
   @param vnode vue编译生成的虚拟节点
   */
  bind (el, binding, vnode) {
    const documentHandler = function(e) {
      if(!vnode.context ||  e.target.id != 'game-scene') {
        return false;
      }
      if (binding.expression) {
        vnode.context[el[HANDLER].methodName](e)
      } else {
        el[HANDLER].bindingFn(e);
      }
    }
    el[HANDLER] = {
      documentHandler,
      methodName: binding.expression,
      bindingFn: binding.value
    }
    setTimeout(() => {
      document.addEventListener(sEvent, documentHandler, false);
    }, 0)
  },
  update (el, binding) {
    el[HANDLER].methodName = binding.expression;
    el[HANDLER].bindingFn = binding.value;
  },
  unbind(el) {
    document.removeEventListener(sEvent, el[HANDLER].documentHandler, false);
  }
}