/* globals sinon */
import Ember from 'ember';
import { AutoSaveProxy } from 'ember-autosave';
import { module, test } from 'qunit';
var run = Ember.run;

var model;
var autoSaveObject;
var clock;

// TODO: Setting save function globally and per instance
// TODO: Only and expect fields
// TODO: Test experience of having data pushed while typing in field
// TODO: Evaluate using isDirty property to trigger saving

module('AutoSaveProxy', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutoSaveProxy.create({ content: model });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('setting a property eventually saves the model with the property', function(assert) {
  autoSaveObject.set('name', 'Millie');
  assert.equal(model.get('name'), 'Millie', "the model's property was set");
  assert.ok(!model.save.called, 'save was not called immediately');

  clock.tick(1000);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test('properties on the model can be retrieved via the proxy', function(assert) {
  model.set('name', 'Tina');
  assert.equal(autoSaveObject.get('name'), 'Tina', "returned model's name attribute");
});

test('a pending save is flushed before the object is destroyed', function(assert) {
  autoSaveObject.set('name', 'Millie');

  Ember.run(function() {
    autoSaveObject.destroy();
  });

  assert.ok(model.save.called, 'save was called before the object was destroyed');
});

test('destroying an object with no pending save is ok', function(assert) {
  Ember.run(function() {
    autoSaveObject.destroy();
  });

  assert.ok(!model.save.called, 'save was not called');
});

test('destroying an object after a save was flushed is ok', function(assert) {
  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);

  Ember.run(function() {
    autoSaveObject.destroy();
  });

  assert.equal(model.save.callCount, 1, 'save was only called once');
});

test('changing the content flushes a pending save', function(assert) {
  autoSaveObject.set('name', 'Millie');
  autoSaveObject.set('content', {});
  assert.ok(model.save.called, 'save was called before the content changed');
});
