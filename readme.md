# Ember Autosave [![Build Status](https://travis-ci.org/mitchlloyd/ember-autosave.svg)](https://travis-ci.org/mitchlloyd/ember-autosave)

Ember Autosave periodically saves your models when their properties are set.

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

The primary way to use this addon is with the computed property macro called
'autosave'.  You can also use underlying AutosaveProxy object.

### Using the Computed Property

The `ember-autosave` package provides a computed property macro to wrap a
property in an AutosaveProxy.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  post: autosave('model')
});
```

### Using AutosaveProxy

You may also use the AutosaveProxy object directly.

```javascript
import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export default Ember.Route.extend({
  didReceiveAttrs() {
    this.post = AutosaveProxy.create({ content: this.get('model') });
  }
});
```

### Advanced Configuration

By default, an AutosaveProxy object will call `save()` on its content once input stops
for 1 second. You can configure this behavior globally or for each AutosaveProxy
instance.

**Global Configuration**

```javascript
// I recommend using an initializer

import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export function initialize() {
  AutosaveProxy.config({
    saveDelay: 3000, // Wait 3 seconds after input has stopped to save
    save: function(model) {
      model.mySpecialSaveMethod()
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
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  post: autosave('model', { saveDelay: 3000, save: 'specialSave' })

  specialSave(model) {
    // Your special save logic here
  }
});
```

With the AutosaveProxy object.

```javascript
import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export default Ember.Component.extend({
  didReceiveAttrs() {
    this.post = AutosaveProxy.create(
      { content: model },
      { saveDelay: 3000, save: this.specialSave.bind(this) }
    );
  },

  specialSave(model) {
    // Your special save logic here
  }
});
```

## Demo

To see a demo of this addon you can clone this repository, run `ember server`,
and visit http://localhost:4200 in your browser.

