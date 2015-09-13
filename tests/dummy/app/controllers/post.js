import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Controller.extend({
  post: autosave('model')
});
