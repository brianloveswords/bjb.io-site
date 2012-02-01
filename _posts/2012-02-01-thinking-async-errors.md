---
layout: post
title: "Thinking Async: Errors"
tags: [nodejs, errors, async]
categories: [development]
---
<aside>
<img src="/assets/error-chain.jpg">
<p>Photo by <a href="http://www.flickr.com/photos/nickwebb/">Nick J Webb</a></p>
</aside>

Here's an piece of code that was causing me some trouble today. See if you can spot the problem:

{% highlight js %}
function getRemoteData (opts, accepted, callback) {
  try {
    request({ method:'head', url:opts.url }, function(err, resp) {
      assert.reachable(err, resp);
      assert.size(resp);
      
      request(opts, function(err, resp, rawBody) {
        assert.reachable(err, resp);
        assert.contentType(resp, accepted);
        assert.size(resp, rawBody);
        
        return callback(null, rawBody);
      })
    })
  } catch(err) { return callback(err); }
}
{% endhighlight %}

The assert methods `throw` Error objects if the test they present is not
passed. For example, `assert.size` looks at the response object and asserts
that it's content-length doesn't exceed a certain size. If any of the
assertions fail, I want to immediately stop executing and hit the callback
with the error.

## Try..catches all the way down
When testing this, I was running into a serious issue: Errors weren't getting
trapped by the `try...catch` block and instead were bubbling up to the very
top, making the process explode. Why is that?

After some staring, thinking and experimenting I figured out the
problem. Before I go into it, here's the working code

{% highlight js %}
function getRemoteData (opts, accepted, callback) {
  try {
    request({ method:'head', url:opts.url }, function(err, resp) {
      try {
        assert.reachable(err, resp);
        assert.size(resp);
      } catch(err) { return callback(err); }
      
      request(opts, function(err, resp, rawBody) {
        try {
          assert.reachable(err, resp);
          assert.contentType(resp, accepted);
          assert.size(resp, rawBody);
        } catch(err) { return callback(err); }
        
        return callback(null, rawBody);
      })
    })
  } catch(err) { return callback(err); }
}
{% endhighlight %}

And here's a simplified case that demonstrates the issue:

{% highlight js %}
// throw-test.js
function thrower(cb) { return cb() };
try {
  thrower(function () { 
    throw new Error("This will be captured");
  });
} catch (e) {
  console.log("We live for now...");
}

try {
  process.nextTick(function () { 
    throw new Error("...but we'll never make it out alive");
  });
} catch (e) {
  console.log(":("); // will never reach here
}
{% endhighlight %}

These were my results when running it:

<aside class='no-stretch'>
<img src="/assets/throw-test-result.png">
</aside>

## It all comes down to scheduling

`thrower` and `process.nextTick` both take one parameter, a callback. To
understand why an error thrown in the callback will bubble in the latter, it's
important to undestand how `process.nextTick` interacts with the event
loop. From the docs,

> On the next loop around the event loop call this callback. This is *not* a simple alias to `setTimeout(fn, 0)`, it's much more efficient.

User-written functions do not have the ability to directly schedule things on
the event loop. You could imagine the schedule looking like this immediately
after each function is invoked:

<pre>
<strong>Now</strong>
1) <em>execute thrower</em> <span style='color: #bb1'>→ continuing, subtask added</span>
   1.1) execute callback
2) …
3) …
⋮
</pre>

<pre>
<strong>Now</strong>
<del>1) execute process.nextTick</del> <span style='color: #181'> ✓done, future task added</span>
2) …
3) …
⋮
   
<strong>Future</strong>
1) execute callback
</pre>

## You can't stop the future

A `try` block will only capture errors that are thrown in the current
tick. `thrower` doesn't reach a completed state until the callback is executed
so if the callback throws an error, it can be trapped because it's still
within the original execution context.

`process.nextTick` reaches a completed state as soon as it schedules the
function for execution. Barring syntax or type errors, it cannot fail. When
the callback gets executed on the next tick it is no longer executing in the
context of a `try` block and the error will bubble through.

## Takeaways

* You can't always tell if a callback-style function is asynchronous -- only
  those that call `setTimeout` or `process.nextTick` to defer execution are
  truly async.

* When `catch`ing errors from asynchronous functions you have to wrap the body
  of the callback, not the calling function.

* This is something you have to worry about if you are using syncronous
  functions in your callbacks. All of the synchronous methods in the standard
  library throw errors.

As an aside, when writing your own methods, you should not be throwing errors
in callback-style functions whether they are truly async or not. By
convention, the first argument to a callback is always either null or
[an error object](http://www.devthought.com/2011/12/22/a-string-is-not-an-error/). Functions
which return a value directly are free to throw errors, as they do in the
standard library.
