---
layout: post
title: God Dammit, VirtualBox
tags: [nodejs, vagrant, puppet, openbadges]
categories: [development]
published: true
---
<aside>
<img src="/assets/machine.jpg">
<p>Photo by <a href="http://www.flickr.com/photos/salz/">s.alt</a></p>
</aside>

I've been working on it easier for developers to contribute to
[my project at Mozilla](https://github.com/mozilla/openbadges). It should not
take a significant amount of time and/or effort to stand up a project before a
developer can start writing code. Even 10 minutes is too much for a person who
just wants to try something out.

## Nobody wants to spend two hours setting up their environment to work on your stupid project

If they didn't think it was stupid before, they'll definitely think so after
battling a frustrating setup process.

Developing in a VM is a great practice for a number of reasons, chief among
them version/dependency hell and not polluting your main OS. You can also
distribute them to developers and they have a known working environment all
packaged and ready to go.

[Vagrant](http://vagrantup.com/) combined with
[Puppet](http://puppetlabs.com/) is just about the greatest thing ever for VM
management. You can easily spin up a new VM to test stuff out and blow it away
with just a few commands.

Another immediate benefit of developing using Vagrant and Puppet is that you
start thinking about deployment while you're developing instead of as an
afterthought -- you could even use the same puppet manifest to provision the
production server.

## Baller, let's do this

I've spent the past couple of days working on a branch of the project that
lets a developer clone the repo, do `vagrant up` and immediately have a fully
working environment ready to go. Everything went relatively smoothly, I built,
provisioned and destroyed dozens of VMs and things seemed to be working.

Not every developer is going to have vagrant -- I'm assuming most won't -- so
I wanted to do a true front-to-back test, as if I just installed VirtualBox
and Vagrant. So I uninstalled and then reinstalled the latest versions of
both, added latest lucid32 box and tried again.

The system spun up and got provisioned like a champ but when `npm
install`ed my app dependencies, things got fucked:

<aside>
<img src="/assets/npm-fucked.png">
<p>UNKNOWN, unknown error. Super helpful, thanks.</p>
</aside>

## And here began six hours of debugging

The first thing I tried was changing the provisioning strategy for installing
node.js and npm. Instead of building from source, I tried
[installing from the package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager). This
did not work.

I tried an experiment: In the VM I made a fresh clone and did npm
install. This worked without issue.

<aside class='no-stretch'>
<img src="/assets/guest-additions.png">
</aside>
 
So maybe the VirtualBox Guest Additions for my VM were fucking everything
up. That's what handles the sharing of a folder between the host machine and
the guest VM. The lucid32 box that vagrant provides has version 4.1.0 and the
latest VirtualBox is 4.1.8.

*By the way*,  it's fucking unbelievable how hard it is to track down VBoxGuestAdditions.iso.
I ended up [getting a copy here](https://launchpad.net/ubuntu/+source/virtualbox-guest-additions-iso)
by digging into the package itself.

**Update**:
<aside class='no-stretch'>
<img src="/assets/guest-additions-iso.png">
</aside>

Anyway after installing and restarting the VM, I tried to do `npm install` and
faced the same results.

## What in the great god damn fuck.

At this point I was baffled. It was working totally fine before using the
latest version of VirtualBox and the new lucid32 box. It works totally fine if
I do `npm install` in any folder other than the one shared from the host.

I'll save you a painful recount of all the crazy shit I went through to find
this out, but I eventually learned that everything comes down to symlinks and
shared directories. I realized that npm was failing at the points when it was
trying to symlink binaries from the packages into the node_modules/bin folder.

Reading through
[this three year old ticket](https://www.virtualbox.org/ticket/818), it seems
that symlinking in shared folders has been fixed and regressed a number of
times. The version that I used to have apparently supported it fine -- the
latest version must have regressed.

## All is not lost

After admitting that I was never going to be able to install the modules in
app directory, the fix was remarkably simple: install packages one directory
up on the guest system. When fufilling a `require` statement node's module
loader ascends the directory tree searching for `node_modules`folders
containing the requested module.

In one sense, I'm glad it didn't work right the first time. In trying to
figure out what was wrong, I ended up rewriting my puppet manifests a number
of times, making things faster and better. I whittled down a nearly ten minute
spin up to a three minute spin up.

But In the other sense, I wish figuring out this was all a VirtualBox
regression didn't take all fucking day.

<footer>
Ragefully written sometime around midnight on January 31th, 2012.
</footer>
