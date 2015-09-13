import Ember from 'ember';
import sinon from 'sinon';
import { module, test } from 'qunit';
import autosave, { AutosaveProxy } from 'ember-autosave';

var clock;

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
  var model = Ember.Object.create({ save: sinon.spy() });
  var autosaveObject = AutosaveProxy.create({ content: model });

  autosaveObject.set('name', 'Millie');
  clock.tick(500);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test('locally overriding saveDelay', function(assert) {
  var model = Ember.Object.create({ save: sinon.spy() });
  var autosaveObject = AutosaveProxy.create({ content: model }, { saveDelay: 250 });

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

  var model = Ember.Object.create({ configuredSave: sinon.spy() });
  var autoSaveObject = AutosaveProxy.create({ content: model });

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.configuredSave.called, 'save was called after ellapsed time');
});

test("using the CP context and string for save", function(assert) {
  var Component = Ember.Object.extend({
    autosaveModel: autosave('model', { save: 'specialSave' }),
    specialSave: sinon.spy(),
    model: {}
  });

  var component = Component.create();
  component.set('autosaveModel.name', 'Millie');
  clock.tick(1000);
  assert.ok(component.specialSave.called, 'save was called after ellapsed time');
});

test('Configuring only fields - only saves when specified field is triggred', function(assert) {
  var model = Ember.Object.create({ save: sinon.spy() });
  var autoSaveObject = AutosaveProxy.create({ content: model }, { only: ['name'] });

  autoSaveObject.set('age', 97);
  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called');

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was not called after ellapsed time');
});

test('configuring `except` fields - only saves when specified field is triggred', function(assert) {
  var model = Ember.Object.create({ save: sinon.spy() });
  var autoSaveObject = AutosaveProxy.create({ content: model }, { except: ['age'] });

  autoSaveObject.set('age', 97);
  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called on `except` property');

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was called');
});
