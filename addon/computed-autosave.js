import { get, computed } from '@ember/object';
import AutosaveProxy from './autosave-proxy';

export default function computedAutosave() {
  let propertyName, options;

  if (typeof arguments[0] === 'string') {
    [propertyName, options = {}] = arguments;
  } else if (typeof arguments[0] === 'object') {
    options = arguments[0];
  } else {
    throw new Error('Invalid arguments passed to computedAutosave: ', arguments);
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
  };

  if (propertyName) {
    return computed(propertyName, computedArgs);
  } else {
    return computed(computedArgs);
  }
}
