import Ember from 'ember';
var get = Ember.get;
var set = Ember.set;
var debounce = Ember.run.debounce;
var cancel = Ember.run.cancel;
var computed = Ember.computed;

var BUFFER_DELAY = 1000;

var AutoSaveProxy = Ember.Object.extend({
  _pendingSave: null,
  _previousContent: null,
  _content: null,

  content: computed('content', function(key, value) {
    if (value === undefined) {
      // Getter
      return this._content;
    } else {
      // Setter
      this._flushPendingSave();
      this._content = value;
      return value;
    }
  }),

  setUnknownProperty: function(key, value) {
    set(this._content, key, value);
    this._pendingSave = debounce(this, this.saveNow, BUFFER_DELAY);
  },

  saveNow: function() {
    this._content.save();
    this._pendingSave = null;
  },

  unknownProperty: function(key) {
    return this._content.get(key);
  },

  willDestroy: function() {
    this._flushPendingSave();
  },

  _flushPendingSave: function() {
    if (this._pendingSave) {
      var context = this._pendingSave[0];
      var fn = this._pendingSave[1];

      // Immediately call the pending save
      fn.call(context);

      // Cancel the pending debounced function
      cancel(this._pendingSave);
    }
  }
});

export function computedAutoSave(propertyName) {
  return computed(propertyName, function(key, value) {
    if (value === undefined) {
      // Getter
      return AutoSaveProxy.create({ content: get(this, propertyName) });
    } else {
      // Setter
      set(this, propertyName, value);
      return AutoSaveProxy.create({ content: get(this, propertyName) });
    }
  });
}

export var AutoSaveProxy;
