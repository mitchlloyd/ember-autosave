/* globals setInterval */
import { run } from '@ember/runloop';

import { on } from '@ember/object/evented';
import Route from '@ember/routing/route';

export default Route.extend({
  updatePost: on('init', function() {
    let store = this.store;

    setInterval(function() {
      run(function() {
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
