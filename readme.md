# Ember Autosave [![Build Status](https://travis-ci.org/mitchlloyd/ember-autosave.svg)](https://travis-ci.org/mitchlloyd/ember-autosave)

Ember Autosave periodically saves your models when their properties are set.

## Installation

```
ember install ember-autosave
```

### Compatibility

If you are using a version of Ember before 3.x you many need to use an older
version of this library.

| Ember Version    | Ember Autosave       |
| -----------------|----------------------|
| 1.8 through 1.13 | 0.3                  |
| 2.0              | 1.x & 2.x            |
| 3.0 and beyond   | 3.x                  |

## Usage

The primary way to use this addon is with the computed property macro called
'autosave'.  You can also use underlying AutosaveProxy object.

### Using `autosave`

The `ember-autosave` package provides a computed property macro to wrap an
object in an AutosaveProxy.

In this example, the proxy will call `save()` on the object stored in the
component's `model` property one second after one of its properties is `set`.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';

export default Ember.Component.extend({
  modelWithAutosave: autosave('model')
});
```

It might be the case that the model data you're working with is internal to a
component and was not passed in as an attribute. In this case you don't have to
pass a string representing a property to `autosave`. The library will store
attributes on a blank object that will be passed to a provided save function.

```javascript
import Ember from 'ember';
import autosave from 'ember-autosave';
const { inject } = Ember;

export default Ember.Component.extend({
  store: inject.service();

  modelWithAutosave: autosave({
    save(attributes) {
      this.get('store').createRecord(attributes).save();
    }
  })
});
```

### Using AutosaveProxy

You may also use the AutosaveProxy object directly.

```javascript
import Ember from 'ember';
import { AutosaveProxy, flushPendingSave } from 'ember-autosave';

export default Ember.Component.extend({
  didReceiveAttrs() {
    this._super(...arguments)
    this.modelWithAutosave = AutosaveProxy.create(this.get('model'));
  }
});
```

Historically this project was used with Ember Data which keeps long-lived
model objects. This side-steps some common timing issues where a pending save
function is called after a model is destroyed. Depending on your situation,
you may find it necessary or desirable to cancel or immeidately flush a
pending save.

```javascript
import Ember from 'ember';
import { AutosaveProxy, flushPendingSave, cancelPendingSave } from 'ember-autosave';

export default Ember.Component.extend({
  didReceiveAttrs() {
    this._super(...arguments);
    flushPendingSave(this.modelWithAutosave);
    this.modelWithAutosave = AutosaveProxy.create(this.get('model'));
  }

  willDestroy() {
    this._super(...arguments);
    cancelPendingSave(this.modelWithAutosave);
    this.modelWithAutosave = AutosaveProxy.create(this.get('model'));
  }
});
```

### Advanced Configuration

By default, an AutosaveProxy object will call `save()` on its target once input stops
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
  modelWithAutosave: autosave('model', {
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
import Component from '@ember/component';
import { AutosaveProxy } from 'ember-autosave';

export default Component.extend({
  didReceiveAttrs() {
    this.modelWithAutosave = AutosaveProxy.create(
      this.get('model'),
      { saveDelay: 3000, save: (model) => model.specialSave() }
    );
  },
});
```

## Demo

To see a demo of this addon you can clone this repository, run `ember server`,
and visit http://localhost:4200 in your browser.

## Upgrading to 1.0

There is one breaking change when migrating from an earlier version to 1.0. In
earlier versions, configured `save` functions were invoked with the context of
the proxy target.

```javascript
import Component from '@ember/component';
import autosave from 'ember-autosave';

export default Component.extend({
  modelWithAutosave: autosave('model', {
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
import Component from '@ember/component';
import autosave from 'ember-autosave';

export default Component.extend({
  someProp: 'hi',

  modelWithAutosave: autosave('model', {
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

## Upgrading to 2.0

Version 2.0 has one semantic change that better aligns it with typical
Ember.set behavior. Before 2.0, setting a property to the same value would
trigger a change (render) and enqueue a `save`. In 2.0, if the set property
`===` the previous value, `save` will not be called and Ember will not be
notified of a property change.

## Upgrading to 3.0

Previously, the AutosaveProxy's model was set using the `content` property
(mirroring the behavior of Ember.ObjectProxy). This caused issues for users
that had a `content` property on their models. Now `AutosaveProxy` objects
are created without specifying a key (`AutosaveProxy.create(model)`) and
models can freely use the `content` key.

Pre 3.0:

```javascript
AutosaveProxy.config({ content: model });
```

3.0 and beyond:

```javascript
AutosaveProxy.create(model);
```

Additionally 3.0 is only guaranteed to be compatible with Ember 3.x because
of a change in Ember's [property change notification API](https://www.emberjs.com/deprecations/v3.x/#toc_use-notifypropertychange-instead-of-propertywillchange-and-propertydidchange).
