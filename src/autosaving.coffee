BUFFER_DELAY = 1000

Ember.AutoSaving = Ember.Mixin.create
  # Buffered fields are saved after the set buffer delay.
  bufferedFields: []

  # InstaSave fields save the model as soon as they change.
  instaSaveFields: []

  # Setup buffers to write to instead of directly editing
  # the model attributes.
  _buffers: Ember.Map.create()

  # If we update a field that has been specified as one of the
  # bufferedFields or instaSaveFields do a safeSet to write
  # to a buffer if the model isSaving.
  setUnknownProperty: (key, value) ->
    @_safeSet(key, value)
    @_debouncedSave() if @_isBufferedField(key)
    @_debouncedSave(now: true) if @get('instaSaveFields').contains(key)

  # Pull properties from the buffer if they have been set there.
  unknownProperty: (key) ->
    if @_buffers.has(key) then @_buffers.get(key) else @_super(key)

  _isBufferedField: (key) ->
    @get('bufferedFields').contains(key) or Em.isEmpty(@get 'bufferedFields')

  _safeSet: (key, value) ->
    if @_isInflight() and @_isBufferedField(key)
      @get('_buffers').set(key, value)
    else
      @get('content').set(key, value)

  _flushBuffersWhenSavingIsComplete: (->
    return if @get('content.isSaving')
    @_flushBuffers()
  ).observes('content.isSaving')

  _flushBuffers: ->
    @get('_buffers').forEach (key, value) =>
      @get('content').set(key, value)
    @set('_buffers', Ember.Map.create())

  # Write the buffers to the actual content and save or
  # try saving again later.
  _safeSave: ->
    return unless @get('content.store')
    unless @_isInflight()
      @_flushBuffers()
      @_saveModelNow()
    else
      @_debouncedSave()

  _saveModelNow: ->
    @get('content.store').commit()

  _isInflight: ->
    @get('content.isSaving') or @get('content.isLoading')

  _debouncedSave: Ember.debounce (-> @_safeSave()), BUFFER_DELAY

  # When the model is about to change out from under the controller we must
  # immediately save any pending changes and clear out the buffers.
  _saveNowAndClear: (->
    return unless @get('content')
    @_debouncedSave(now: true)
  ).observesBefore('content')

