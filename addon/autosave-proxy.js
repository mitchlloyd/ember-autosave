import { assert } from '@ember/debug';
import { debounce, cancel } from '@ember/runloop';
import EmberObject, {
  set,
  get,
  computed
} from '@ember/object';

const targetProxyKey = '__emberAutosaveTargetProxy__';
const storageKey = '__emberAutosaveStorage__';

let AutosaveProxy = EmberObject.extend({
  // This must be defined on the prototype to be considered a "known" property.
  [storageKey]: null,

  [targetProxyKey]: computed(targetProxyKey, {
    get: function(){
      return this[storageKey].target;
    },

    set: function(key, value) {
      flushPendingSave(this);
      this[storageKey].target = value;

      return value;
    }
  }),

  setUnknownProperty: function(key, value) {
    let target = this[storageKey].target;
    let oldValue = get(target, key);

    if (oldValue !== value) {
      set(target, key, value);
      this.notifyPropertyChange(key);

      let options = this[storageKey].options;
      if (isConfiguredProperty(options, key)) {
        let saveDelay = options.saveDelay;
        this[storageKey].pendingSave = debounce(this, save, this, saveDelay);
      }
    }
  },

  unknownProperty: function(key) {
    let storage = get(this, storageKey);
    return get(storage.target, key);
  },

  willDestroy: function() {
    flushPendingSave(this);
  }
});

AutosaveProxy.reopenClass({
  defaultOptions: {
    save: function(model) {
      model.save();
    },
    saveDelay: 1000,
    context: undefined
  },

  config: function(options) {
    this.options = options;
  },

  create: function(target, localOptions) {
    let options = Object.assign(
      {},
      this.defaultOptions, // Default library options
      this.options, // Global custom config options
      localOptions, // Local custom config options
    );

    // Cannot use EmberObject.init() for this because it happens too late.
    // this._super() set properties before init is called.
    let attrs = {
      [storageKey]: {
        target: undefined,
        pendingSave: undefined,
        options,
      },
      [targetProxyKey]: target || {},
    };
    return this._super(attrs);
  }
});

function isConfiguredProperty(options, prop) {
  assert("You can configure the `only` option or the `except` option, but not both", !(options.only && options.except));

  if (options.only) {
    return options.only.indexOf(prop) !== -1;
  } else if (options.except) {
    return options.except.indexOf(prop) === -1;
  } else {
    return true;
  }
}

function save(autosaveProxy) {
  let options = autosaveProxy[storageKey].options;
  let context = options.context;
  let saveOption = options.save;

  let saveFunction;
  if (typeof saveOption === 'function') {
    saveFunction = saveOption;
  } else {
    saveFunction = context[saveOption];
  }

  autosaveProxy[storageKey].pendingSave = undefined;
  return saveFunction.call(context, autosaveProxy[storageKey].target);
}

function flushPendingSave(autosaveProxy) {
  let pendingSave = autosaveProxy[storageKey].pendingSave;
  if (pendingSave !== undefined) {
    // Cancel the pending debounced function
    cancel(pendingSave);

    // Immediately call save
    return save(autosaveProxy);
  }
}

function cancelPendingSave(autosaveProxy) {
  cancel(autosaveProxy[storageKey].pendingSave);
}

function setProxyTarget(autosaveProxy, obj) {
  set(autosaveProxy, targetProxyKey, obj);
}

export default AutosaveProxy;
export { flushPendingSave, cancelPendingSave, setProxyTarget };
