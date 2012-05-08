---
layout: post
title: "An argument against subclassing <code>Error</code>"
tags: [nodejs, errors, inheritance]
categories: [development]
published: true
---
<aside>
  <img src="http://farm8.staticflickr.com/7042/6926632251_acee70f4c5_z.jpg">
  <p>
    <a href="http://creativecommons.org/licenses/by-nc-nd/2.0/" title="Attribution-NonCommercial-NoDerivs License">Some rights reserved</a>
    by
    <a href="http://www.flickr.com/photos/linkwize/">linkwize</a>
  </p>
</aside>

First off, if you haven't already you should read
“[A String is not an Error](http://www.devthought.com/2011/12/22/a-string-is-not-an-error/),”
by Guillermo Rauch. The *tl;dr* of it is that you shouldn’t be returning or
throwing Strings where errors are expected.

A few days ago I jumped into a
[conversation on a pull request for grunt](https://github.com/cowboy/grunt/issues/146)
about the best way to detect whether an object is an error or not. I suggested
using node's `util.isError`, which uses `Object.prototype.toString.call` to
get the internal class of the object and ensures that it equals
`[object Error]`. This strict check turns out to not be ideal for the use case
since the code in question is expected handle custom errors. Here's an example
of how it fails:

{% highlight js %}
var err;
// straight from “A String is not an Error”
function MongooseError (msg) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = msg;
  this.name = 'MongooseError';
}
MongooseError.prototype.__proto__ = Error.prototype;

// these are good…
err = new MongooseError('nope');
assert.ok(err instanceof Error);
assert.ok(err instanceof MongooseError);

// …but using util.isError doesn't work.
util.isError(err); // === false
{% endhighlight %}

This seemed like a legitimate shortcoming of `util.isError` so **@cowboy**
[raised an issue on node](https://github.com/joyent/node/issues/3212), but
node's intention for `util.isError` is extremely accuracy so the issue was
closed. While closing it **@TooTallNate** suggested an alternative way to subclass
error such that the internal class gets set to `[class Error]` (which I will
adapt to fit our example):

{% highlight js %}
var err;
function MongooseError (msg) {
  var self = new Error(msg); // get the stack trace for free.
  self.name = 'MongooseError';
  self.__proto__ = MongooseError.prototype;
  return self;
}
MongooseError.prototype.__proto__ = Error.prototype;

// still good…
err = new MongooseError('yep');
assert.ok(err instanceof Error);
assert.ok(err instanceof MongooseError);

// …and this will work since it's a true [object Error]
util.isError(err); // === true
{% endhighlight %}

But there was something else in his response that got me thinking.

## Does subclassing `Error` really add much value in the end?

After thinking about it I realized that I agree with **@TooTallNate** that it
really doesn’t add much value, especially considering how unintuitive it is to
get it right.

I could see some value if JavaScript had syntactic support for multiple`catch` blocks:

{% highlight js %}
try {
  module.errorProneFunction();
}
catch (TypeError error) { log('incorrect type') }
catch (ParseError error) { log('problem parsing') }
catch (RangeError error) { log('input out of range') }
catch (module.CustomError) { log('custom module error') }
catch (Error error) { log('some other type of error') }
{% endhighlight %}

But we don't, and in node it’s likely that we're getting our errors in the form of
`callback(error)` so we're not going to be a `try` block anyway. This is a
more likely scenario:

{% highlight js %}
module.errorProneFunction(function (error) {
  if (util.isError(error)) {
    if (error instanceof TypeError) log('incorrect type');
    else if (error instanceof ParseError) log('problem parsing');
    else if (error instanceof RangeError) log('input out of range');
    else if (error instanceof module.CustomError) log('custom module error');
    else throw error; //can't handle it, crash.
  }
});
{% endhighlight %}

`instanceof` depends on a reference to the error constructor, so you're going
to have to export that from your module to use this pattern.

Since all of the built-in errors set a `name` property your custom errors
should so as well. Given that we can use a pattern which doesn't rely on
`instanceof` or having a reference to your custom error constructor:

{% highlight js %}
module.errorProneFunction(function (error) {
  if (util.isError(error)) {
    if (error.name == 'TypeError') log('incorrect type');
    else if (error.name == 'ParseError') log('problem parsing');
    else if (error.name == 'RangeError') log('input out of range');
    else if (error.name == 'ModuleCustomError') log('custom module error');
    else throw error;
  }
  // you could also use `switch...case` if that’s your cup of jam.
});
{% endhighlight %}

But half the reason to subclass `Error` is so we can compare instances and
here we’re finding out that it might be simpler to not use `instanceof` at
all.

## What about more complicated errors?

The other case for subclassing `Error` is to make attaching a bunch of
properties to the object easier. You might have something like this:

{% highlight js %}
var VERSION = 1.0;
// ...
function APIError (msg, route) {
  var self = new Error(msg); // get the stack trace for free.
  self.name = 'APIError';
  self.version = VERSION;
  self.route = route;
  self.__proto__ = APIError.prototype;
  return self;
}
APIError.prototype.__proto__ = Error.prototype;
// ...
throw new APIError('forbidden or whatever', '/admin/destroy/all/humans/');
{% endhighlight %}

In the end that's a lot of boilerplate when the following accomplishes the
same effect:

{% highlight js %}
var error = new Error('forbidden or whatever');
error.name = 'APIError';
error.version = VERSION;
error.route = '/admin/destroy/all/humans/';
throw error;
{% endhighlight %}

and if you find yourself typing that all over the place, you can make a
straightforward helper that doesn't have to deal with the complexity of
inheriting from `Error`:

{% highlight js %}
function apiError (msg, route) {
  var error = new Error(msg);
  error.name = 'APIError';
  error.version = VERSION;
  error.route = route;
  return error;
}
// ...
throw apiError('forbidden or whatever', '/admin/destroy/all/humans/');
{% endhighlight %}

One downside to using a helper is that `error.stack` is going to include an
entry for the helper. You can either ignore it, clean it up in your helper by
doing some string manipulation or use something like
[https://github.com/flatiron/errs](https://github.com/flatiron/errs) which
abstracts all of that away for you and provides a lot of other nice stuff.

## Conclusion
Subclassing `Error` is not intuitive and makes dealing with errors hard if
done incorrectly. If you really must subclass `Error`, do it correctly:

{% highlight js %}
function CustomError (msg) {
  var self = new Error(msg);
  self.name = 'CustomError';
  self.__proto__ = CustomError.prototype;
  return self;
}
CustomError.prototype.__proto__ = Error.prototype;
{% endhighlight %}

but I encourage you to think about whether or not it’s worth the complexity.

<footer>
Composed on March 6th, 2012.
</footer>
