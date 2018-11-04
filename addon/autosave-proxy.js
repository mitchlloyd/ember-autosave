import { assert } from '@ember/debug';
import EmberObject, { set, get } from '@ember/object';

// Store properties off the autosave object to avoid triggering unknownProperty
// hooks and to avoid conflict with the developer-provided model object.
const privateStore = new WeakMap();

let AutosaveProxy = EmberObject.extend({
  setUnknownProperty: function(key, value) {
    let privateProps = privateStore.get(this);
    let oldValue = get(privateProps.target, key);

    if (oldValue !== value) {
      set(privateProps.target, key, value);
      this.notifyPropertyChange(key);

      let options = privateProps.options;
      if (isConfiguredProperty(options, key)) {
        let saveDelay = options.saveDelay;
        clearTimeout(privateProps.pendingSave);
        privateProps.pendingSave = setTimeout(() => save(this), saveDelay);
      }
    }
  },

  unknownProperty: function(key) {
    return get(privateStore.get(this).target, key);
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

    let obj = this._super();
    privateStore.set(obj, {
      target: target || {},
      pendingSave: undefined,
      options,
    });

    return obj;
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
  let privateProps = privateStore.get(autosaveProxy);
  let { context, save } = privateProps.options;

  let saveFunction;
  if (typeof save === 'function') {
    saveFunction = save;
  } else {
    saveFunction = context[save];
  }

  privateProps.pendingSave = undefined;

  return saveFunction.call(context, privateProps.target);
}

function flushPendingSave(autosaveProxy) {
  if (!autosaveProxy) {
    return;
  }

  let pendingSave = privateStore.get(autosaveProxy).pendingSave;
  if (pendingSave !== undefined) {
    // Cancel the pending debounced function
    clearTimeout(pendingSave);

    // Immediately call save
    return save(autosaveProxy);
  }
}

function cancelPendingSave(autosaveProxy) {
  if (!autosaveProxy) {
    return;
  }

  clearTimeout(privateStore.get(autosaveProxy).pendingSave);
}

export default AutosaveProxy;
export { flushPendingSave, cancelPendingSave };
