import EmberObject, { set } from '@ember/object';
import sinon from 'sinon';
import autosave from 'ember-autosave';
import { module, test } from 'qunit';

var model;
var clock;

module('Using autosave computed property', {
  beforeEach: function() {
    model = EmberObject.create({ save: sinon.spy() });
    clock = sinon.useFakeTimers();
  },

  afterEach: function() {
    clock.restore();
  }
});

test('setting a property eventually saves the model with the property', function(assert) {
  var Component = EmberObject.extend({
    autosaveObject: autosave('model')
  });

  var component = Component.create({ model: model });

  set(component, 'autosaveObject.name', 'Millie');

  assert.ok(!model.save.called, 'save was not called immediately');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test("using the computed property context and string for save", function(assert) {
  var Component = EmberObject.extend({
    autosaveModel: autosave('model', { save: 'specialSave' }),

    specialSave: function(model) {
      model.save();
    }
  });

  var component = Component.create({ model: model });
  component.set('autosaveModel.name', 'Millie');
  clock.tick(1000);
  assert.ok(model.save.called, 'save was called after ellapsed time');
});

test('specifying a save function without content key', function(assert) {
  var Component = EmberObject.extend({
    someProp: 'some-prop',

    person: autosave({
      save: function(attrs) {
        model.save(attrs, this.someProp);
      }
    })
  });

  var component = Component.create();

  set(component, 'person.name', 'Millie');

  clock.tick(1000);
  assert.ok(model.save.called, 'save was called after ellapsed time');
  assert.ok(model.save.calledWith({ name: 'Millie' }, 'some-prop'), "called with correct arguments");
});
