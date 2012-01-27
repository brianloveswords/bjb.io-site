# Setup Git

In this step, we will set up the project for our new website.   It is generally a best practice to develop a website with a source control management (SCM) system.  For Heroku, the hosting provider we are using, it is a requirement.  So we'll install some SCM software if we don't have it already, create a new project, add a file to that project and then commit it to the project.

## Install git
"git" is a free, open source SCM that we will use to version control our project.  Available for Windows, Mac and Linux, git is very popular and becoming widely adopted in the web development community.  

You can [download and install here](http://git-scm.com/download)

## Create a project
Creating our project is as simple as creating a new folder on our computer.  This folder can live anywhere you want to keep your web work.  If you have any doubt where to put the folder, go ahead and create it on your desktop.

## Initialize git
Open a terminal window and navigate to the folder you just created.  Once inside, initialize the project by typing:

    git init

## Create new file
Now that we have an empty repository to work with, we'll create a new file to add to the project.  It is customary to include a README file in all your programming project - canonically accepted helper documentation to which the next developer who works on your project can refer.  In this case, we'll create a new text file using the editor of our choice and call it README.md.

Inside the new file, we'll add a little text for people to learn something about our project.

    Hello World with Python
    ==========================

    This is my first website using Python.  I hope you like it.

    Credits
    --------------------------
    * Author: [your name here!]
    * Peer: [list your favorite peers from P2PU]

## Add and commit file to project
Once we have a README file for our project, we need to tell git about it so it can track all its versions.  To do this, we use our terminal window again and type the following command:

    git add README.md

After we tell git that we want the file to be version controlled, we need to "commit" it to the project.  A commit tells git that you are finished working with the file - that this version is complete.  Again, we use our terminal window and type the following command:

    git commit -a -m "Added a README file"

## Show Your Stuff
Now it's time to share your work with your peers!  In order to do this, we need to share our commit log with the group.  The commit log is a list of the versions of the files you've made so far.  This will show if we completed the task correctly.

Yet again, we go to our terminal window and use a git command:

    git log

Copy/paste the product of the command, and post in a comment to the task.

**Note:** `git log` will include your email address.  If you would prefer not to share with the group, go ahead and delete the line it is on.

