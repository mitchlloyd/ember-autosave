import Ember from 'ember';
import sinon from 'sinon';
import { module, test } from 'qunit';
import autosave, { AutosaveProxy } from 'ember-autosave';

var model;
var autoSaveObject;
var clock;

module('AutosaveProxy - globally overriding the save delay', {
  beforeEach: function() {
    AutosaveProxy.config({ saveDelay: 500 });
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutosaveProxy.create({ content: model });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
    AutosaveProxy.config({});
  }
});

test('saves according to the new delay time', function(assert) {
  autoSaveObject.set('name', 'Millie');
  clock.tick(500);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});


module('AutosaveProxy - locally overriding the save delay', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutosaveProxy.create({ content: model }, { saveDelay: 250 });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('saves according to the new delay time', function(assert) {
  autoSaveObject.set('name', 'Millie');
  clock.tick(250);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});


module('AutosaveProxy - configuring save function globally', {
  beforeEach: function() {
    AutosaveProxy.config({
      save: function(model) {
        model.configuredSave();
      }
    });

    model = Ember.Object.create({ configuredSave: sinon.spy() });
    autoSaveObject = AutosaveProxy.create({ content: model });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
    AutosaveProxy.config({});
  }
});

test('saves with the configured function', function(assert) {
  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.configuredSave.called, 'save was called after ellapsed time');
});


module('computedAutosave - saving with the CP context', {
  beforeEach: function() {
    var Component = Ember.Object.extend({
      autosaveModel: autosave('model', { save: 'specialSave' }),
      specialSave: sinon.spy(),
      model: {}
    });

    this.component = Component.create();
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test("saves with the context's function", function(assert) {
  this.component.set('autosaveModel.name', 'Millie');
  clock.tick(1000);
  assert.ok(this.component.specialSave.called, 'save was called after ellapsed time');
});


module('AutosaveProxy - configuring `only` fields', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutosaveProxy.create({ content: model }, { only: ['name'] });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('only saves when specified field is triggred', function(assert) {
  autoSaveObject.set('age', 97);
  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called');

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was not called after ellapsed time');
});


module('AutosaveProxy - configuring `except` fields', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutosaveProxy.create({ content: model }, { except: ['age'] });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('only saves when specified field is triggred', function(assert) {
  autoSaveObject.set('age', 97);
  clock.tick(1000);
  assert.ok(!model.save.called, 'save was not called on `except` property');

  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was called');
});
