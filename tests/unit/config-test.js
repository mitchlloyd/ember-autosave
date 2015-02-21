/* globals sinon */
import Ember from 'ember';
import { AutoSaveProxy } from 'ember-autosave';
import { module, test } from 'qunit';

var model;
var autoSaveObject;
var clock;

module('AutoSaveProxy - globally overriding the save delay', {
  beforeEach: function() {
    AutoSaveProxy.config({ saveDelay: 500 });
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutoSaveProxy.create({ content: model });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
    AutoSaveProxy.config({});
  }
});

test('saves according to the new delay time', function(assert) {
  autoSaveObject.set('name', 'Millie');
  clock.tick(500);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

module('AutoSaveProxy - locally overriding the save delay', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    autoSaveObject = AutoSaveProxy.create({ content: model }, { saveDelay: 250 });
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

module('AutoSaveProxy - configuring save function globally', {
  beforeEach: function() {
    AutoSaveProxy.config({
      save: function() {
        this.configuredSave();
      }
    });

    model = Ember.Object.create({ configuredSave: sinon.spy() });
    autoSaveObject = AutoSaveProxy.create({ content: model });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
    AutoSaveProxy.config({});
  }
});

test('saves with the configured function', function(assert) {
  autoSaveObject.set('name', 'Millie');
  clock.tick(1000);
  assert.ok(model.configuredSave.called, 'save was called after ellapsed time');
});

