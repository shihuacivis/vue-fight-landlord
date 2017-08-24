const HANDLER = '_vue_touchmove_handler';
const EVENT_MOBILE = 'touchmove';
const EVENT_PC = 'mousemove';
export default {
  /*
   @param el 指令所绑定的元素
   @param binding {Object}
   @param vnode vue编译生成的虚拟节点
   */
  bind (el, binding, vnode) {
    const documentHandler = function(e) {
      let bMobile = navigator.userAgent.match(/Android/i)  
                || navigator.userAgent.match(/webOS/i)  
                || navigator.userAgent.match(/iPhone/i)  
                || navigator.userAgent.match(/iPad/i)  
                || navigator.userAgent.match(/iPod/i)  
                || navigator.userAgent.match(/BlackBerry/i)  
                || navigator.userAgent.match(/Windows Phone/i);
      if (bMobile && e.type == EVENT_PC) {
        return false;
      } else if (!bMobile &&  e.type == EVENT_MOBILE){
        return false;
      }
      let params = {clientX: 0, clientX: 0};
      if (bMobile) {
        let clientX = e.touches[0].clientX;
        let clientY = e.touches[0].clientY;
        params = {clientX, clientY};
      } else {
        let clientX = e.clientX;
        let clientY = e.clientY;
        params = {clientX, clientY};
      }
      let $target = document.elementFromPoint(params.clientX, params.clientY);
      let index = -1;
      let aTargetEl = [];
      while ($target.tagName.toLowerCase() != 'body') {
        aTargetEl.push($target);
        $target = $target.parentNode;
      }
      for (let idx = 0, len = el.childNodes.length; idx < len; idx++) {
        let child = el.childNodes[idx];
        for (let i = 0, l = aTargetEl.length; i < l; i++) {
          let oEl = aTargetEl[i];
          if (child.isEqualNode(oEl)) {
            index = idx;
            break;
          }
        }
      }
      if(!vnode.context) {
        return false;
      }
      if (binding.expression) {
        vnode.context[el[HANDLER].methodName](index)
      } else {
        el[HANDLER].bindingFn(index);
      }
    }
    el[HANDLER] = {
      documentHandler,
      methodName: binding.expression,
      bindingFn: binding.value
    }
    setTimeout(() => {
      el.addEventListener(EVENT_MOBILE, documentHandler, false);
      el.addEventListener(EVENT_PC, documentHandler, false);
    }, 0)
  },
  update (el, binding) {
    el[HANDLER].methodName = binding.expression;
    el[HANDLER].bindingFn = binding.value;
  },
  unbind(el) {
    el.removeEventListener(EVENT_MOBILE, el[HANDLER].documentHandler, false);
    el.removeEventListener(EVENT_PC, el[HANDLER].documentHandler, false);
  }
}