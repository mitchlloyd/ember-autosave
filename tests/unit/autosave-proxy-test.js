import Ember from 'ember';
import sinon from 'sinon';
import { AutosaveProxy, flushPendingSave } from 'ember-autosave';
import { module, test } from 'qunit';

var model;
var autosaveObject;
var clock;

module('AutosaveProxy', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    autosaveObject = AutosaveProxy.create({ content: model });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('setting a property eventually saves the model with the property', function(assert) {
  autosaveObject.set('name', 'Millie');
  assert.equal(model.get('name'), 'Millie', "the model's property was set");
  assert.ok(!model.save.called, 'save was not called immediately');

  clock.tick(1000);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test('properties on the model can be retrieved via the proxy', function(assert) {
  model.set('name', 'Tina');
  assert.equal(autosaveObject.get('name'), 'Tina', "returned model's name attribute");
});

test('a pending save is flushed before the object is destroyed', function(assert) {
  autosaveObject.set('name', 'Millie');

  Ember.run(function() {
    autosaveObject.destroy();
  });

  assert.ok(model.save.called, 'save was called before the object was destroyed');
});

test('destroying an object with no pending save is ok', function(assert) {
  Ember.run(function() {
    autosaveObject.destroy();
  });

  assert.ok(!model.save.called, 'save was not called');
});

test('destroying an object after a save was flushed is ok', function(assert) {
  autosaveObject.set('name', 'Millie');
  clock.tick(1000);

  Ember.run(function() {
    autosaveObject.destroy();
  });

  assert.equal(model.save.callCount, 1, 'save was only called once');
});

test('changing the content flushes a pending save', function(assert) {
  autosaveObject.set('name', 'Millie');
  autosaveObject.set('content', {});
  assert.ok(model.save.called, 'save was called before the content changed');
});

test('setting a property to the same value', function(assert) {
  model.set('will-set-same-value', 1);
  autosaveObject.set('will-set-same-value', 1);

  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called on same value');
});

test('flushPendingSave cancels debounced save', function(assert) {
  autosaveObject.set('name', 'Millie');
  assert.ok(!model.save.called, 'save was not called immediately');

  flushPendingSave(autosaveObject);
  assert.equal(model.save.callCount, 1, 'save called once after calling flushPendingSave');

  clock.tick(1000);
  assert.equal(model.save.callCount, 1, 'save not called later from debounce');
});
