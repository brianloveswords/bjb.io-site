 In this step we will get you set up with the tools necessary to deploy your
web app to Heroku.

# Why Heroku?
[Heroku](http://heroku.com) is a hosting platform that makes it easy to experiment and
prototype. They provide a toolkit that works with what many developers are
already using (git) and they provide hosting for small apps free of
charge. For experimenting with a new language or framework, it's often
essential to get a prototype up and running quickly without having to worry
about deployment, and Heroku provides that ease-of-use.

# Getting started

First thing is
[to sign up for a Heroku account](https://api.heroku.com/signup). It's free
and takes less than two minutes.

Next you'll need to [download the Heroku Toolbelt for your platform](http://toolbelt.herokuapp.com/)
The package will install the `heroku` command and make sure it's in your PATH.

# Heroku'ing your project

Open your terminal and `cd` into the directory you created when you were
setting up your project with git. You can do a `git status` to make sure you
are in the right place -- if you are not, you will get a message saying:
`fatal: Not a git repository (or any of the parent directories): .git` or
something equally off-putting.

Once you are in the correct directory, type into the terminal:

`heroku create --stack cedar`

This will create a heroku app on the cedar stack and add a remote repository
to git. (bonus excerise: research what other stacks there are and why we are
using cedar).  It will also let you know where you can find you know where you
can find your webapp once you've completed it.

To complete this exercise, copy the output of running the above command as a
comment into the task.
