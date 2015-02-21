/* globals setInterval */
import Ember from 'ember';

export default Ember.Route.extend({
  updatePost: Ember.on('init', function() {
    var store = this.store;

    setInterval(function() {
      Ember.run(function() {
        store.pushPayload('post', {
          post: {
            id: 2,
            title: 'Updated Title',
            body: 'Updated Body'
          }
        });
      });
    }, 1000);
  })
});
