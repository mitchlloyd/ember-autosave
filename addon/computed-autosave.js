import Ember from 'ember';
import AutosaveProxy from './autosave-proxy';
var get = Ember.get;
var set = Ember.set;
var computed = Ember.computed;

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

      let content;
      if (propertyName) {
        content = get(this, propertyName);
      }

      return AutosaveProxy.create({ content: content }, options);
    },

    set: function(key, value, proxy){
      set(proxy, 'content', value);
      return proxy;
    }
  };

  if (propertyName) {
    return computed(propertyName, computedArgs);
  } else {
    return computed(computedArgs);
  }
}
