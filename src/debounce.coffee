Ember.debounce = (func, wait) ->
  timeout = {}

  ->
    context = this
    args = arguments

    lastArg = args[args.length - 1]
    immediate = true if lastArg and lastArg.now

    later = ->
      timeout[context] = null
      func.apply(context, args)

    clearTimeout(timeout[context])

    if immediate
      func.apply(context, args)
    else
      timeout[context] = setTimeout(later, wait)

