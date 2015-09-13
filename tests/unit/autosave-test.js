import Ember from 'ember';
import sinon from 'sinon';
import autosave from 'ember-autosave';
import { module, test } from 'qunit';
const { set } = Ember;

var model;
var clock;

module('Using computed property', {
  beforeEach: function() {
    model = Ember.Object.create({ save: sinon.spy() });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('setting a property eventually saves the model with the property', function(assert) {
  var Component = Ember.Object.extend({
    autosaveObject: autosave('model')
  });

  var model = { save: sinon.spy() };
  var component = Component.create({ model: model });

  set(component, 'autosaveObject.name', 'Millie');

  assert.ok(!model.save.called, 'save was not called immediately');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});
