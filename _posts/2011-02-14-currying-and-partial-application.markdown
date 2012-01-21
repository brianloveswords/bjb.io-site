---
layout: post
title: Currying and Partial Application
tags: [javascript, haskell, currying]
categories: [development]
---

<aside>
<img src="/assets/currying.jpg">
<p>Photo by <a href="http://www.flickr.com/photos/flavorrelish">flavorrelish</a></p>
</aside>

I've been learning Haskell from the fantastic online book [Learn You a Haskell for Great Good!](http://learnyouahaskell.com/) and there's a concept in the language that I've just started to wrap my head around.

In Haskell, every function formally only takes one parameter. The syntactic sweetness of Haskell does its best to hide the user from this fact.

Let's define a function:
    
    addThree x y z = x + y + z

<!-- -----------------
The syntax is designed to coax you into believing that this function takes three arguments. If you checkout the type declaration of the function, there's a hint there:

    addThree :: (Num a) => a -> a -> a -> a 

The book probably does a better job of explaining this than I could, but I'll give it a shot. The `(Num a) =>` part is saying “Any `a` that follows is of the type `Num`”. This part is technically irrelevant, for what I'm explaining, but it's good to know why it's there.

After that there comes a chain of `a -> a`, which is actually Haskell sugar. It should really read

    addThree :: (Num a) => a -> (a -> ( a -> a) )

------------------- -->


## Better understanding through JavaScript
Here's how I would have naïvely implemented the addThree method in JS.
    
    var addThree = function(x, y, z) { return x + y + z }  //wrong

This doesn't actually capture what's going on underneath. Here's the actual equivalent function:

    var addThree = function(x) {
      return (function(y) {
        return (function(z) {
          return x + y + z 
        })
      })
    }

To end up with an integer value, you call would call the curried version like so:

    addThree(5)(8)(13) == 26 //true

But you could have a partial application of addThree which returns a function:

    var addSixteenTo = addThree(8)(8) //one function left in chain
    addSixteenTo(112) == 128 //true

## Bringing it back around
There is an example in [the book](http://learnyouahaskell.com/) that really drove the point home for me. The author describes another way to define the addThree function (`\x -> ...` is the Haskell syntax for a lambda):

    addThree = \x -> \y -> \z -> x + y + z

Also, here are two different ways to call addThree:

    addThree 3 8 16
    ((addThree 3) 8) 16

Both of these make it clear that each parameter is really adding another single-parameter function to the chain. Haskell has so much syntactic sugar, it's amazing. While it does occasionally make learning the underlying concepts more difficult, it's really joy to play with this language.

<footer>
Posted on Febraury 14th, 2011. Written much earlier.
</footer>
