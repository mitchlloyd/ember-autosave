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

### Using `autosave`

The `ember-autosave` package provides a computed property macro to wrap a
property in an AutosaveProxy.

In this example, the proxy will call `save()` on the component's model property
after one second.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  post: autosave('model')
});
```

You don't have to specify a property to proxy to if you don't need this
behavior.  The library will store attributes on a blank object for you to use in
a save function.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';
const { inject } = Ember;

export default Ember.Component.extend({
  store: inject.service();

  post: autosave({
    save(attributes) {
      this.get('store').createRecord(attributes).save();
    }
  })
});
```

Naturally, you may want to immediately update the properties on some model
and have a custom `save` function.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  post: autosave('model', {
    save(model) {
      model.set('user', this.get('user'));
      model.save();
    }
  })
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

You can configure `AutosaveProxy` from anywhere, but you should probably use an
initializer.

```javascript
import Ember from 'ember';
import { AutosaveProxy } from 'ember-autosave';

export function initialize() {
  AutosaveProxy.config({
    saveDelay: 3000, // Wait 3 seconds after input has stopped to save

    save(model) {
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

With the `autosave` computed property:

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  post: autosave('model', {
    saveDelay: 3000,

    // Can be a function or a string pointing to a method.
    save: 'specialSave'
  })

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

## Upgrading to 1.0

There is one breaking change when migrating from an earlier version to 1.0. In
earlier versions, configured `save` functions were invoked with the context of
the proxy content.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  post: autosave('model', {
    save() {
      // `this` is the model property
      this.save();
    }
  })
});
```

In 1.0 the context of the `save` function is the instance of the object where
the autosave property was defined (probably what you would expect). The `save`
method receives the model as an argument.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  someProp: 'hi',

  post: autosave('model', {
    save(model) {
      this.get('someProp'); // 'hi'
      model.save();
    }
  })
});
```

Globally configured save functions will need to be updated.

Pre 1.0:

```javascript
AutosaveProxy.config({
  save() {
    this.mySpecialSaveMethod();
  }
});
```

1.0 and beyond:

```javascript
AutosaveProxy.config({
  save(model) {
    model.mySpecialSaveMethod();
  }
});
```
