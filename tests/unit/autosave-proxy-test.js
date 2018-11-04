import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import { AutosaveProxy, flushPendingSave, cancelPendingSave } from 'ember-autosave';
import { module, test } from 'qunit';

let model;
let autosaveObject;
let clock;

module('AutosaveProxy', function(hooks) {
  hooks.beforeEach(function() {
    model = EmberObject.create({ save: sinon.spy() });
    autosaveObject = AutosaveProxy.create(model);
    clock = sinon.useFakeTimers();
  });

  hooks.afterEach(function() {
    clock.restore();
  });

  test('setting a property eventually saves the model with the property', async function(assert) {
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

    run(function() {
      autosaveObject.destroy();
    });

    assert.ok(model.save.called, 'save was called before the object was destroyed');
  });

  test('destroying an object with no pending save is ok', function(assert) {
    run(function() {
      autosaveObject.destroy();
    });

    assert.ok(!model.save.called, 'save was not called');
  });

  test('destroying an object after a save was flushed is ok', function(assert) {
    autosaveObject.set('name', 'Millie');
    clock.tick(1000);

    run(function() {
      autosaveObject.destroy();
    });

    assert.equal(model.save.callCount, 1, 'save was only called once');
  });

  test('calling flushPendingSave flushes a pending save', function(assert) {
    autosaveObject.set('name', 'Millie');
    flushPendingSave(autosaveObject);
    assert.equal(model.save.callCount, 1, 'save immediately called');
    clock.tick(1000);
    assert.equal(model.save.callCount, 1, 'save not called again after debounce period');
  });

  test('setting a property to the same value', function(assert) {
    model.set('will-set-same-value', 1);
    autosaveObject.set('will-set-same-value', 1);

    clock.tick(1000);
    assert.ok(!model.save.called, 'save was not called on same value');
  });

  test('cancelPendingSave cancels debounced save', function(assert) {
    autosaveObject.set('name', 'Millie');
    assert.ok(!model.save.called, 'save was not called immediately');

    cancelPendingSave(autosaveObject);
    clock.tick(1000);
    assert.equal(model.save.callCount, 0, 'save not called');
  });

  test('calling flushPendingSave on undefined or null is a noop', function(assert) {
    assert.expect(0);
    flushPendingSave(null);
    flushPendingSave(undefined);
    flushPendingSave(0);
    flushPendingSave(false);
  });

  test('calling cancelPendingSave on undefined or null is a noop', function(assert) {
    assert.expect(0);
    flushPendingSave(null);
    flushPendingSave(undefined);
    flushPendingSave(0);
    flushPendingSave(false);
  });
});
