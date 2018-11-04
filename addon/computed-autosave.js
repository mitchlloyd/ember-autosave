import { get, computed } from '@ember/object';
import AutosaveProxy, { setProxyTarget } from './autosave-proxy';

export default function computedAutosave() {
  let propertyName, options;

  if (typeof arguments[0] === 'string') {
    propertyName = arguments[0];
    options = arguments[1] || {};
  } else if (typeof arguments[0] === 'object') {
    options = arguments[0];
  }

  let computedArgs = {
    get: function() {
      options.context = this;

      let model;
      if (propertyName) {
        model = get(this, propertyName);
      }

      return AutosaveProxy.create(model, options);
    },

    set: function(key, value, proxy){
      setProxyTarget(proxy, value);

      return proxy;
    }
  };

  if (propertyName) {
    return computed(propertyName, computedArgs);
  } else {
    return computed(computedArgs);
  }
}
