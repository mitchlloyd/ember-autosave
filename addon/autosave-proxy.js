import { assert } from '@ember/debug';
import { debounce, cancel } from '@ember/runloop';
import EmberObject, {
  set,
  get,
  computed
} from '@ember/object';

var AutosaveProxy = EmberObject.extend({
  _pendingSave: null,
  _options: null,
  _content: null,

  content: computed('content', {
    get: function(){
      return this._content;
    },

    set: function(key, value) {
      flushPendingSave(this);
      this._content = value;
      return value;
    }
  }),

  setUnknownProperty: function(key, value) {
    var oldValue = get(this._content, key);

    if (oldValue !== value) {
      set(this._content, key, value);
      this.notifyPropertyChange(key);

      if (isConfiguredProperty(this._options, key)) {
        var saveDelay = this._options.saveDelay;
        this._pendingSave = debounce(this, save, this, saveDelay);
      }
    }
  },

  unknownProperty: function(key) {
    return get(this._content, key);
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

    saveDelay: 1000
  },

  config: function(options) {
    this.options = options;
  },

  create: function(attrs, localOptions) {
    let options = Object.assign(
      {},
      this.defaultOptions, // Default library options
      this.options, // Global custom config options
      localOptions, // Local custom config options
    );

    attrs._options = options;

    if (attrs.content === undefined) {
      attrs.content = {};
    }

    var obj = this._super(attrs);

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
  var context = autosaveProxy._options.context;
  var saveOption = autosaveProxy._options.save;

  var saveFunction;
  if (typeof saveOption === 'function') {
    saveFunction = saveOption;
  } else {
    saveFunction = context[saveOption];
  }

  autosaveProxy._pendingSave = null;
  return saveFunction.call(context, autosaveProxy._content);
}

function flushPendingSave(autosaveProxy) {
  let pendingSave = autosaveProxy._pendingSave;
  if (pendingSave !== null) {
    // Cancel the pending debounced function
    cancel(pendingSave);

    // Immediately call save
    return save(autosaveProxy);
  }
}

function cancelPendingSave(autosaveProxy) {
  cancel(autosaveProxy._pendingSave);
}

export default AutosaveProxy;
export { flushPendingSave, cancelPendingSave };
