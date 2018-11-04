import EmberObject from '@ember/object';
import sinon from 'sinon';
import { module, test } from 'qunit';
import { AutosaveProxy } from 'ember-autosave';

let clock;

module('Configuration', {
  beforeEach: function() {
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
    AutosaveProxy.config({});
  }
});

test('globally overriding saveDelay', function(assert) {
  AutosaveProxy.config({ saveDelay: 500 });
  let model = EmberObject.create({ save: sinon.spy() });
  let autosaveObject = AutosaveProxy.create(model);

  autosaveObject.set('name', 'Millie');
  clock.tick(500);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test('locally overriding saveDelay', function(assert) {
  let model = EmberObject.create({ save: sinon.spy() });
  let autosaveObject = AutosaveProxy.create(model, { saveDelay: 250 });

  autosaveObject.set('name', 'Millie');
  clock.tick(250);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test('globally overriding save function', function(assert) {
  AutosaveProxy.config({
    save: function(model) {
      model.configuredSave();
    }
  });

  let model = EmberObject.create({ configuredSave: sinon.spy() });
  let autoSaveObject = AutosaveProxy.create(model);

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.configuredSave.called, 'save was called after ellapsed time');
});

test('Configuring only fields - only saves when specified field is triggred', function(assert) {
  let model = EmberObject.create({ save: sinon.spy() });
  let autoSaveObject = AutosaveProxy.create(model, { only: ['name'] });

  autoSaveObject.set('age', 97);
  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called');

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was not called after ellapsed time');
});

test('configuring `except` fields - only saves when specified field is triggred', function(assert) {
  let model = EmberObject.create({ save: sinon.spy() });
  let autoSaveObject = AutosaveProxy.create(model, { except: ['age'] });

  autoSaveObject.set('age', 97);
  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called on `except` property');

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was called');
});
