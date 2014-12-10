Reading
=======

A cataloging app for reading.

I created this app because I wanted a closed system to easily view things that I have read, notes, and relationships between books (and art, movies, comics, games, articles, etc).  I looked at other cataloging apps but they either provided too little or too much functionality, so I just built this, having pretty good html/css/javascript chops, zero mongo exprience and zero node experience.  It was sort of a pain, but ultimately fun, and it basically works!  I'm pretty sure I'm doing a lot of silly things on the backend, so if you happen to want to use this and are a more experienced developer than I am, please let me know how I could have programmed this more efficiently, and I might update it.  

Anyway, after building it, I thought other people might be interested to use it as well.  I think it will be a powerful way of looking at things that I actually have read or experienced and piecing together out of those things without having to pour through loosely organized notes, spreadsheets, whatever.  I don't have any real interest in building a site where people can just sign up and use the app, but I figured there might be a few people technical enough to just install it on a heroku server and use it, or even develop it further.

If so, here are some basic instructions to get it running.



Using the command line (or terminal), go to a directory where you want to host the project and clone this repo and move into the reading directory.

`$ git clone https://github.com/owenroberts/reading.git`

`$ cd reading`

Make an account at [Heroku](https://www.heroku.com/).  You may want to take a look at [Getting Started with Node](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) if you get stuck in the next part.

Once you have an account, go back to command line and login to Heroku from the reading app directory.

`$ heroku login`

It will prompt you to enter the email and password for the Heroku account you created, and you should see "Authenitation successful".  Next create the app:

`$ heroku create`

If you want to change the name of the app from the funny name Heroku will automatically create, use:

`$ heroku apps:rename newname`

Now you need to create a database to store the book data using MongoLab.  Add a MongoLab starter db to Heroku:

`$ heroku addons:add mongolab`

Now set up a password for the HTTP authentication.  After looking around at some different authentication methods with users and stuff, I decided this was simple and would work well enough.  It's not the most secure solution, but I imagine it will be good enough for individual catalog apps, and heroku runs on HTTPS, so should be okay.  Anyway, create an htpasswd file and add a username and password for yourself (replace username and password with actual username and password):

`$ htpasswd -bc htpasswd username password`

Now you need to push this password file to the app using git:

`$ git add .`
`$ git commit -m "adds htpasswd"`
`$ git push heroku master`

If you make changes to the app and decide to share the code somewhere, you will want to remove the htpasswd file.

You should now be good to go.  You can open the app from the command line:

`$ heroku open`

You should be prompted for the username and password you just created.

You will then see the homepage of the app, with a button that says "Initialize info".  This prepares the database with some basic information about the types of media or whatever you are cataloging. 

If you want to change the basic units of media you can do this in the `app.js` file on line `71`.  There you will see a function `bookProvider.init` with the first argument being an object with keys `_atts`, `_types`, and `_fields`.  You most likely do not want to edit `_atts` or `_fields` at all, but if you're not cataloging the "types" of things that I have listed there (you can add new types within the app) you may want to remove these and replace them with your own (they're just the basic types of things I want to keep track of that I came up with while creating it).  If you do, you will need to commit the changes and push the new version.

```javascript
"_types" : [
              "book",
              "article",
              "film/movie",
              "art",
              "comix",
              "game"
            ],
```

If you want to change the style of the app, take a look in `/public/stylesheets/style.styl`.  You can change the basic color scheme at the top using the color variables:

```css
primary = #8181C7
secondary = #f3f
highlight = #fdf
bkg = #E0E0E0
wht = #fff
```
...or make bigger changes in the rest of the document.  I think it's pretty straight forward.  Eventually I want to save the styles in Mongo and make a page where you can change styles.

If any of this doesn't work or you don't like or you like it or think you know how to do it better, shoot me an email, I'd be interested to hear thoughts.

Also, f you want to develop locally, you will need to open bookprovider.js and follow the directions in the comments to comment out the database connection for mongolab and uncomment the connection for the local database.  You will also have to make the local database.

Those instructions coming soon.

To do:
- Instructions for ~~installing for use~~ and development.
- Ability to create new attributes.
- ~~User authentication.~~ Using http auth instead.
- Mobile styles.
- Delete references and references need to get deleted when books are deleted.
- Also "book doesn't exist page" if for some reason database gets modified outside program.
- Create custom styles and save them.
