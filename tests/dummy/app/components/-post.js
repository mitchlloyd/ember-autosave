import Component from '@ember/component';
import autosave from 'ember-autosave';

export default Component.extend({
  autosavePost: autosave('post')
});
