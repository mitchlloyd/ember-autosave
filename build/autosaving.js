(function() {
  var BUFFER_DELAY;

  BUFFER_DELAY = 1000;

  Ember.AutoSaving = Ember.Mixin.create({
    bufferedFields: [],
    instaSaveFields: [],
    _buffers: Ember.Map.create(),
    setUnknownProperty: function(key, value) {
      this._safeSet(key, value);
      if (this._isBufferedField(key)) {
        this._debouncedSave();
      }
      if (this.get('instaSaveFields').contains(key)) {
        return this._debouncedSave({
          now: true
        });
      }
    },
    unknownProperty: function(key) {
      if (this._buffers.has(key)) {
        return this._buffers.get(key);
      } else {
        return this._super(key);
      }
    },
    _isBufferedField: function(key) {
      return this.get('bufferedFields').contains(key) || Em.isEmpty(this.get('bufferedFields'));
    },
    _safeSet: function(key, value) {
      if (this._isInflight() && this._isBufferedField(key)) {
        return this.get('_buffers').set(key, value);
      } else {
        return this.get('content').set(key, value);
      }
    },
    _flushBuffersWhenSavingIsComplete: (function() {
      if (this.get('content.isSaving')) {
        return;
      }
      return this._flushBuffers();
    }).observes('content.isSaving'),
    _flushBuffers: function() {
      var _this = this;

      this.get('_buffers').forEach(function(key, value) {
        return _this.get('content').set(key, value);
      });
      return this.set('_buffers', Ember.Map.create());
    },
    _safeSave: function() {
      if (!this.get('content.store')) {
        return;
      }
      if (!this._isInflight()) {
        this._flushBuffers();
        return this.get('content.store').commit();
      } else {
        return this._debouncedSave();
      }
    },
    _isInflight: function() {
      return this.get('content.isSaving') || this.get('content.isLoading');
    },
    _debouncedSave: Ember.debounce((function() {
      return this._safeSave();
    }), BUFFER_DELAY),
    _saveNowAndClear: (function() {
      if (!this.get('content')) {
        return;
      }
      return this._debouncedSave({
        now: true
      });
    }).observesBefore('content'),
	_saveOnCreate: function() {
		if (this._created) return;
		
		this._created = true;
		return this._debouncedSave();
	}.observes('content'),
	delete: function(item) {
		var transaction = this.get("store").transaction();
		transaction.add(item);
        item.deleteRecord();
		transaction.commit();
		return this._debouncedSave();
    }
  });

}).call(this);
