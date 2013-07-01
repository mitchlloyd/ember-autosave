should = chai.should()

Ember.AutoSavingController = Ember.ObjectController.extend Ember.AutoSaving,
  bufferedFields: ['key']
  instaSaveFields: ['instaSaveKey']

FakeModel = Ember.Object.extend(Ember.Evented)

describe "A controller using the autoSaving mixin", ->
  beforeEach ->
    @controller = Ember.AutoSavingController.create()
    @store = {}
    @store.commit = sinon.spy()
    @model = FakeModel.create(store: @store)

  describe "when the model isn't inflight", ->
    beforeEach ->
      @controller.set 'content', @model

    it "writes attributes directly to the model", ->
      @controller.set('key', 'value')
      @model.get('key').should.equal 'value'

    it "reads attributes directly to the model", ->
      @model.set('key', 'value')
      @controller.get('key').should.equal 'value'

  describe "when the model is saving", ->
    beforeEach ->
      @model.set('isSaving', true)
      @controller.set 'content', @model

    it "writes and reads attributes with a buffer", ->
      @controller.set('key', 'value')
      should.not.exist @model.get('key')
      @controller.get('key').should.equal 'value'

    it "writes attributes to the model when saving is complete", ->
      @controller.set('key', 'value')
      @model.set('isSaving', false)
      @model.get('key').should.equal 'value'

  describe "Debounced saving", ->
    beforeEach ->
      @controller.set 'content', @model
      @clock = sinon.useFakeTimers()

    afterEach -> @clock.restore()

    it "waits to save the model on a bufferedField", ->
      @controller.set('key', 'value')
      @store.commit.called.should.be.false
      @clock.tick(1000)
      @store.commit.called.should.be.true

    it "immediately saves the model on an instaSaveField", ->
      @controller.set('instaSaveKey', 'value')
      @store.commit.called.should.be.true

    it "immediately saves the model when it is swapped", ->
      @controller.set('key', 'value')
      @controller.set('content', {})
      @store.commit.called.should.be.true
      @model.get('key').should.equal 'value'

