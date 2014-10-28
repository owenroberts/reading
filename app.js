var express = require('express'),
		path = require('path'), 
		http = require('http'), 
		path = require('path'),
		BookProvider = require('./bookprovider').BookProvider;
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.set('view options', {layout: false});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/users', users);

app.get('/', function(req, res){
  bookProvider.findAll(function(error, bks){
      res.render('index', {
            title: 'Reded',
            books:bks
        });
  });
});

app.get('/book/new', function(req, res) {
    res.render('book_new', {
        title: 'New Book'
    });
});

app.post('/book/new', function(req, res){
    bookProvider.save({
        title: req.param('title'),
        name: req.param('name'),
        genre: req.param('genre'),
        pubdate: req.param('pubdate'),
        readdate: req.param('readdate'),
        quotes: ['Add first quote here.']
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/book/:id/edit', function(req, res) {
    bookProvider.findById(req.param('_id'), function(error, book) { 
        bookProvider.findAll(function(error, books){
            res.render('book_edit', {
                books:books,
                book: book
            });
        });
    });
});

app.post('/book/:id/edit', function(req, res) {
    var editedBook = {};
    for (item in req.body) { 
        if (item != '_id' && item != 'newlabel' && item != 'newvalue') {
            if (item == 'newquote') {
                editedBook["$push"] = {};
                editedBook["$push"] = {'quotes': req.body[item]}
            } else {
                //editedBook["$set"] = {};
                //editedBook["$set"][item] = req.body[item];
            }
        }
    }
    console.log(editedBook);
    if (Object.getOwnPropertyNames(editedBook).length > 0) {
        bookProvider.update(req.param('_id'), editedBook, function(error, docs) {
            res.redirect(req.get('referer'));
        });
    } else {
        res.redirect(req.get('referer'));
    }
});

//delete a book
app.post('/book/:id/delete', function(req, res) {
        bookProvider.delete(req.param('_id'), function(error, docs) {
                res.redirect('/')
        });
});

var bookProvider = new BookProvider('localhost', 27017);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



app.listen(3000);
module.exports = app;
