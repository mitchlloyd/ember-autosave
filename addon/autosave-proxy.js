import Ember from 'ember';
var set = Ember.set;
var setProperties = Ember.setProperties;
var debounce = Ember.run.debounce;
var cancel = Ember.run.cancel;
var computed = Ember.computed;

var AutosaveProxy = Ember.ObjectProxy.extend({
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
    set(this._content, key, value);

    if (isConfiguredProperty(this._options, key)) {
      var saveDelay = this._options.saveDelay;
      this._pendingSave = debounce(this, save, this, saveDelay);
    }
  },

  unknownProperty: function(key) {
    return this._content.get(key);
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
    // Default library options
    let options = Ember.copy(this.defaultOptions);

    // Global custom config options
    setProperties(options, this.options);

    // Local custom config options
    setProperties(options, localOptions);

    attrs._options = options;

    if (attrs.content === undefined) {
      attrs.content = {};
    }

    var obj = this._super(attrs);

    return obj;
  }
});

function isConfiguredProperty(options, prop) {
  Ember.assert("You can configure the `only` option or the `except` option, but not both", !(options.only && options.except));

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
  if (pendingSave) {
    var context = pendingSave[0];
    var fn = pendingSave[1];

    // Cancel the pending debounced function
    cancel(autosaveProxy);

    // Immediately call the pending save
    return fn(context);
  }
}

function cancelPendingSave(autosaveProxy) {
  cancel(autosaveProxy._pendingSave);
}

export default AutosaveProxy;
export { flushPendingSave, cancelPendingSave };
