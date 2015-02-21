import Ember from 'ember';
import AutosaveObject from 'ember-autosave';

export default Ember.Component.extend({
  post: Ember.computed('model', function() {
    return AutosaveObject.create({content: this.get('model')});
  })
});
