Take a look at [this blog
post](http://blog.gaslight.co/post/53361504301/an-autosave-pattern-for-ember-and-ember-data)
to learn about this library.

Usage
-----

Use the mixin in a controller.

```coffee
App.DocumentController = Ember.ObjectController.extend Ember.AutoSaving,
  bufferedFields: ['title', 'body']
  instaSaveFields: ['postedAt', 'category']
```

Fields in `bufferedFields` will save after user input stops for 1 second. Fields
in `instaSaveFields` will save immediately and save any pending changes in
`bufferedFields`.

Developing
----------

    bundle install # install dependencies
    guard          # watch CoffeeScript files for changes
    open test.html # run the tests in the browser

Thanks
------

* Thanks to [nhemsley](https://github.com/nhemsley) for making the debounce method context aware.
* Thanks to [tim-evans](https://github.com/tim-evans) for [an example of how to immediately update models if
  they are not being saved](https://gist.github.com/tim-evans/5783095).
