 In this step, we will be building a simple web app using node.js and the
[express framework](http://expressjs.com/)

# A short bit about node.js
If you're here, you probably have some sort of idea what node.js is all
about: JavaScript on the server. To some people this is sacrilege
("JavaScript? On *my* server?"), but it's actually proven to be quite capable
as a server side language.

The crux of node.js is event loop: everything runs in a single thread, and the
default I/O methods run asyncronously as to not block the loop. If that all
doesn't make sense, that's okay.

# Getting & Installing node.js
If you're running Windows or OS X, you can
[download a package to install node for your system](http://nodejs.org/#download). If
you're on some flavor of Linux, use your package manager of choice. You can
find more information about installing via package manager
[at the node.js github wiki](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

# A note about node.js versions
node.js (and all npm packages, which we will get to) follow the
[Semantic Versioning](http://semver.org/) scheme. If that's TL;DR, the idea is
the it follow X.Y.Z for it's version number, where X is the major version, Y
is the minor version and Z is the patch version.

node.js release versioning use the
[same system as the Linux kernel](http://en.wikipedia.org/wiki/Software_versioning#Odd-numbered_versions_for_development_releases)
-- even minor versions stable releases, odd minor versions for unstable or development
versions. Development will break backwards compatibility, experiment with new
APIs that may not make it to stable releases and do other wacky things, so for
beginners it's best to stick with the stable releases for now.

As of writing, the latest stable node.js is **v0.6.8**. The version supported
by heroku's cedar stack is **v0.4.7**. For the purposes of this challenge, this
shouldn't be a problem. As an exercise left to the reader, after you finish,
try to figure out how to A) run a different version of node.js on heroku,
and/or B) figure out how to install node.js v0.4.7 on your system (which may
involve building from source!)

# Okay, I've installed node.js, now what?

As a matter of best practices, it's good to write your `package.json`
first. Here is an example to get you started:

    {
      "name": "hello-node",
      "description": "A tiny little hello world app in node, using express",
      "version": "0.0.1",
      "dependencies": {
        "express": "2.5.x"
      }
    }

Not only is this file necessary for heroku, it makes using npm more
awesome. For example, you can do:

    npm install

and it will install `express` and all its dependencies into the "node_modules"
folder. Go ahead and `ls` to make sure it's there, and feel free to explore
the directory structure npm created.

## Deeper Dive
If you want to learn about all of the things you can include in package.json, enter this into your terminal:

    npm help json

Be warned: It's a lot of stuff. Another, more digestable resource is an
article by Charlie Robbins of [nodejitsu](http://nodejitsu.com) called
"[Package.json dependencies done right](http://blog.nodejitsu.com/package-dependencies-done-right)".

# Let's write the thing
Using your favorite text editor (preferably one that has syntax highlighting
for JavaScript), create a file called "web.js" and put this in it:

    var express = require('express');

    var app = express.createServer(express.logger());

    app.get('/', function(request, response) {
      response.send('Hello, world.');
    });

    var port = process.env.PORT || 3000;
    app.listen(port, function() {
      console.log('Listening on ' + port);
    })

Create another file, call it "Procfile", and put this inside:

    web: node web.js

Make sure to save both those files into your project folder, then type
`foreman start`. If everything goes to plan, you should see something like
this:

    00:18:11 web.1     | started with pid 97759
    00:18:11 web.1     | Listening on 5000

(Notice: your timestamp at the beginning will be different, as well as your
[pid](http://en.wikipedia.org/wiki/Process_identifier)). Now open up your web
browser, point it to http://localhost:5000/ and you should see your friendly
web server greeting the world in response!

When you want to stop the server, press Ctrl+C in the terminal.

If everything is working correctly, this would be a great time to make a
commit. If you don't remember how and you're feeling adventurous, type `git`
into your terminal and read what comes up. If you don't understand a command,
you can type `git help` followed by the name of the command to get more
information. Alternatively, you can always check back in the first task where
we set up git.

## Wait, something went wrong!
This is a great opportunity to learn how to get help! Copy any error messages
you get and put them in the comments, along with what you were trying to do
when that happened. You can also try googling those error messages to see if
someone has had the same problem. A large part of development is figuring out
what went wrong and then figuring out how to solve it -- we depend on our
peers to help us with both of these things!

# (self-)EDITORS NOTES
* should I try to break down "web.js" line by line? Or should I make that some extra credit?
* also, same thing with Procfile and `foreman`. I feel like this task is really dense already.
