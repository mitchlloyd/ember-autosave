# Ember Autosave

This ember-cli addon provides a proxy object that saves a wrapped model when
properties are set.

## Installation

```
ember install ember-autosave
```

### Compatibility

If you are using a version of Ember before 1.12.0, you **must** use version
0.3.x or older of this library. In general, version 0.3.x of Ember Autosave will
keep compatibility with the Ember 1.x series (although there may be deprecations
warnings) and version 1.x.x will keep compatibility with the Ember 2.x series.

| Ember Version    | Ember Autosave       |
| -----------------|----------------------|
| 1.8 through 1.13 | 0.3.x                |
| 2.0 and beyond   | 1.x.x                |

## Usage

There are two primary ways to use the addon: with the computed property macro
or by creating an AutosaveProxy object.

### Using the Computed Property

The `ember-autosave` package provides a computed property macro to wrap a
property in an AutosaveProxy.

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

### Advanced Configuration

By default, an AutosaveProxy object will call `save()` on its content once input stops
for 1 second. You can configure this behavior globally or for each AutosaveProxy
instance.

**Global Configuration**

```javascript
// Using an initializer is recommended

import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export function initialize() {
  AutosaveProxy.config({
    saveDelay: 3000, // Wait 3 seconds after input has stopped to save
    save: function() {
      // The context here is the wrapped model
      this.mySpecialSaveMethod()
    }
  });
}

export default {
  name: 'setup-ember-autosave',
  initialize: initialize
};
```


**Per Instance Configuration**

With the computed property:

```javascript
import Ember from 'ember';
import { computedAutosave } from 'ember-autosave';

export default Ember.Controller.extend({
  post: computedAutosave('model', { saveDelay: 3000 })
});
```

With the AutosaveProxy object.

```javascript
import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export default Ember.Route.extend({
  setupController: function(controller, model) {
    autosaveProxy = AutosaveProxy.create({ content: model }, { saveDelay: 3000 });
    controller.set('model', autosaveProxy);
  }
});
```

## Demo

To see a demo of this addon you can clone this repository, run `ember server`,
and visit http://localhost:4200 in your browser.

