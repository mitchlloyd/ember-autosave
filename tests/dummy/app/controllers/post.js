import Ember from 'ember';
import { computedAutoSave } from 'ember-autosave';

export default Ember.Controller.extend({
  post: computedAutoSave('model')
});
