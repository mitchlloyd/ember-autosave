should = chai.should()

FakeModel = Ember.Object.extend(Ember.Evented)

it.behavesLikeABufferedField = (field) ->
  describe "when the model isn't inflight", ->
    beforeEach ->
      @controller.set 'content', @model

    it "writes attributes directly to the model", ->
      @controller.set(field, 'value')
      @model.get(field).should.equal 'value'

    it "reads attributes directly to the model", ->
      @model.set(field, 'value')
      @controller.get(field).should.equal 'value'

  describe "when the model is saving", ->
    beforeEach ->
      @model.set('isSaving', true)
      @controller.set 'content', @model

    it "writes and reads attributes with a buffer", ->
      @controller.set(field, 'value')
      should.not.exist @model.get(field)
      @controller.get(field).should.equal 'value'

    it "writes attributes to the model when saving is complete", ->
      @controller.set(field, 'value')
      @model.set('isSaving', false)
      @model.get(field).should.equal 'value'

  describe "debounced saving", ->
    beforeEach ->
      @controller.set 'content', @model
      @clock = sinon.useFakeTimers()

    afterEach -> @clock.restore()

    it "waits to save the model on a bufferedField", ->
      @controller.set(field, 'value')
      @store.commit.called.should.be.false
      @clock.tick(1000)
      @store.commit.called.should.be.true

    it "immediately saves the model when it is swapped", ->
      @controller.set(field, 'value')
      @controller.set('content', {})
      @store.commit.called.should.be.true
      @model.get(field).should.equal 'value'

it.behavesLikeANormalAttribute = (field) ->
  describe "when the model is saving", ->
    beforeEach ->
      @model.set('isSaving', true)
      @controller.set 'content', @model

    it "writes and reads attributes directly to the model", ->
      @controller.set(field, 'value')
      @model.get(field).should.equal 'value'

  describe "debounced saving", ->
    beforeEach ->
      @controller.set 'content', @model
      @clock = sinon.useFakeTimers()

    afterEach -> @clock.restore()

    it "dosen't save the model on a bufferedField", ->
      @controller.set(field, 'value')
      @clock.tick(1000)
      @store.commit.called.should.be.false

it.behavesLikeAnInstaSaveField = (field) ->
  describe "when the model isn't inflight", ->
    beforeEach ->
      @controller.set 'content', @model

    it "immediately saves the model on an instaSaveField", ->
      @controller.set(field, 'value')
      @store.commit.called.should.be.true


describe "A controller using the autoSaving mixin", ->
  beforeEach ->
    AutoSavingController = Ember.ObjectController.extend Ember.AutoSaving,
      instaSaveFields: ['instaSaveKey']

    @controller = AutoSavingController.create()
    @store = {commit: sinon.spy()}
    @model = FakeModel.create(store: @store)

  describe "all attributes", ->
    it.behavesLikeABufferedField('key')

  describe "instaSaveKeys", ->
    it.behavesLikeAnInstaSaveField('instaSaveKey')


describe "A controller specifying bufferedFields", ->
  beforeEach ->
    AutoSavingController = Ember.ObjectController.extend Ember.AutoSaving,
      bufferedFields: ['bufferedKey']

    @controller = AutoSavingController.create()
    @store = {commit: sinon.spy()}
    @model = FakeModel.create(store: @store)

  describe "bufferedKey behaves like a buffered field", ->
    it.behavesLikeABufferedField('bufferedKey')

  describe "normal attributes aren't affected", ->
    it.behavesLikeANormalAttribute('key')

