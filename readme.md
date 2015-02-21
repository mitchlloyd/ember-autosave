# Ember Autosave

This ember-cli addon provides a proxy object that saves a wrapped model when
its properties are set.

## Installation

```
  ember install:addon
```

## Usage

There are two primay ways to use the addon:

### Using the Computed Property

The `ember-autosave` package provides a computed property utility to wrap a
property in an auto save proxy.

```javascript
import Ember from 'ember';
import { computedAutosave } from 'ember-autosave';

export default Ember.Controller.extend({
  post: computedAutosave('model')
});
```

### Using AutosaveProxy

You may also use the AutosaveProxy object directly.

```javascript
import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export default Ember.Route.extend({
  setupController: function(controller, model) {
    autosaveProxy = AutosaveProxy.create({ content: model });
    controller.set('model', autosaveProxy);
  }
});
```

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
