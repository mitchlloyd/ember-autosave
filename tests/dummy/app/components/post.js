import Ember from 'ember';
import AutoSaveObject from 'ember-cli-autosave';

export default Ember.Component.extend({
  post: Ember.computed('model', function() {
    return AutoSaveObject.create({content: this.get('model')});
  })
});
