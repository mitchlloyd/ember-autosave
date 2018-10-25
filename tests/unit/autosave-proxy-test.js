import { run } from '@ember/runloop';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import { AutosaveProxy, flushPendingSave } from 'ember-autosave';
import { module, test } from 'qunit';

let model;
let autosaveObject;
let clock;

/*
  These tests don't work in Ember 3.5.0 because we need this fix:
  https://github.com/emberjs/ember.js/commit/e4e5e3c0e6f2e150457f8bd16557b0092b18126b
*/

module('AutosaveProxy', function(hooks) {
  hooks.beforeEach(function() {
    model = EmberObject.create({ save: sinon.spy() });
    autosaveObject = AutosaveProxy.create({ content: model });
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
});
