import Ember from 'ember';
import { computedAutoSave } from 'ember-cli-autosave';

export default Ember.Controller.extend({
  post: computedAutoSave('model')
});
