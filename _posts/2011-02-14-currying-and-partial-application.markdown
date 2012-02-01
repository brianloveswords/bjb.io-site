---
layout: post
title: Currying and Partial Application
tags: [javascript, haskell, currying]
categories: [development]
published: true
---

<aside>
<img src="/assets/currying.jpg">
<p>Photo by <a href="http://www.flickr.com/photos/flavorrelish">flavorrelish</a></p>
</aside>

I've been learning Haskell from the fantastic online book [Learn You a Haskell for Great Good!](http://learnyouahaskell.com/) and there's a concept in the language that I've just started to wrap my head around.

In Haskell, every function formally only takes one parameter. The syntactic sweetness of Haskell does its best to hide the user from this fact.

Let's define a function:
    
{% highlight haskell %}
addThree x y z = x + y + z
{% endhighlight %}



## Better understanding through JavaScript
Here's how I would have naïvely implemented the addThree method in JS.
    
{% highlight js %}
var addThree = function(x, y, z) { return x + y + z }  //wrong
{% endhighlight %}

This doesn't actually capture what's going on underneath. Here's the actual equivalent function:

{% highlight js %}
var addThree = function(x) {
  return (function(y) {
    return (function(z) {
      return x + y + z 
    })
  })
}
{% endhighlight %}

To end up with an integer value, you call would call the curried version like so:

{% highlight js %}
addThree(5)(8)(13) == 26 //true
{% endhighlight %}

But you could have a partial application of addThree which returns a function:

{% highlight js %}
var addSixteenTo = addThree(8)(8) //one function left in chain
addSixteenTo(112) == 128 //true
{% endhighlight %}

## Bringing it back around
There is an example in [the book](http://learnyouahaskell.com/) that really drove the point home for me. The author describes another way to define the addThree function (`\x -> ...` is the Haskell syntax for a lambda):

{% highlight haskell %}
addThree = \x -> \y -> \z -> x + y + z
{% endhighlight %}

Also, here are two different ways to call addThree:

{% highlight haskell %}
addThree 3 8 16
((addThree 3) 8) 16
{% endhighlight %}


Both of these make it clear that each parameter is really adding another single-parameter function to the chain. Haskell has so much syntactic sugar, it's amazing. While it does occasionally make learning the underlying concepts more difficult, it's really joy to play with this language.

<footer>
Posted on Febraury 14th, 2011. Written much earlier.
</footer>
