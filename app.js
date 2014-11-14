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

// homepage
app.get('/', function(req, res){
  bookProvider.findAll(function(error, bks){
      res.render('index', {
            title: 'Reded',
            books:bks
        });
  });
});

// create a book
app.get('/book/new', function(req, res) {
    bookProvider.getInfo(function(error, info) {
        res.render('book_new', {
            info:info,
            title: 'New Book'
        });
    });
});

// saves created book
app.post('/book/new', function(req, res){
    console.log(req.query);
    bookProvider.save({
        title: req.param('title'),
        type: req.param('type'),
        name: req.param('name'),
        genre: req.param('genre'),
        pubdate: req.param('pubdate'),
        readdate: req.param('readdate'),
        quotes: ['Add first quote here.'],
        notes: ['Add first note here.']
    }, function( error, docs) {
        res.redirect('/')
    });
});

// edit a book
app.get('/book/:id/edit', function(req, res) {
    bookProvider.findById(req.param('_id'), function(error, book, info) { 
        if (book.refs != undefined) {
            bookProvider.getRefs(book.refs, function(error, refs){
                res.render('book_edit', {
                    refs:refs,
                    book: book,
                    info:info,
                    title: book.title
                });
            });
        } else {
            res.render('book_edit', {
                book: book,
                info: info,
                title: book.title
            });
        }       
    });
});

// save book
app.post('/book/:id/edit', function(req, res) {
    var editedBook = {};
    console.log(req.body);
    for (item in req.body) { 
        if (item != '_id' && item != 'newlabel' && item != 'newvalue') {
            var newitem = false;
            if (item == 'newquote') {
                editedBook["$push"] = {};
                editedBook["$push"] = {'quotes': req.body[item]};
            } else if (item == 'newnote') {
                editedBook["$push"] = {};
                editedBook["$push"] = {'notes': req.body[item]};
            } else if (item == 'newlink') {
                editedBook["$push"] = {};
                editedBook["$push"] = {'links': req.body[item].split(',')};
            } else if (item == 'newtag') {
                editedBook["$addToSet"] = {};
                editedBook["$addToSet"] = {'tags': req.body[item]};
                bookProvider.addTag({info:{$exists:true}}, {$addToSet:{"info._tags":req.body[item]}});
            } else if (item == '_refId') {
                editedBook["$addToSet"] = {};
                editedBook["$addToSet"] = {'refs': {refId:req.body["_refId"], refNote:req.body["_refNote"]}};
                bookProvider.addReferencedBy(req.body["_refId"], req.body["_title"], req.body["_id"], req.body["_refNote"]);
            } else if (item[0] == "+"){
                if (!newitem) editedBook["$set"] = {};
                newitem = true;
                var st = item.substr(1);
                if ((st == "notes" || st == "quotes") && !(req.body[item] instanceof Array))
                    editedBook["$set"][st] = [req.body[item]];
                else
                    editedBook["$set"][st] = req.body[item];
            }
        }
    }
    console.log(editedBook);
    if (Object.getOwnPropertyNames(editedBook).length > 0) {
        bookProvider.update(req.param('_id'), editedBook, function(error, docs) {
            res.redirect('/book/:id/edit?_id='+req.body._id);
        });
    } else {
        res.redirect(req.get('referer'));
    }
});


// get all tags
app.get('/:tag', function(req, res) {
    bookProvider.findTag(req.param('_tag'), function(error, books) { 
        res.render('index', {
            books:books,
            title: req.query["_tag"]
        });
    });
});

//get references query 
app.get('/addref/search', function(req, res) {
    bookProvider.searchRefs(req.query, function(error, books) { 
        res.render('search_refs', {
            bookId:req.query["_id"],
            bookTitle:req.query["_bookTitle"],
            books:books,
            title: req.query["_field"] + ": " + req.query["_ref"]
        });
    });
});

//get references browse 
app.get('/addref/browse', function(req, res) {
    bookProvider.browseRefs(req.query, function(error, books) { 
        res.render('browse_refs', {
            bookId:req.query["_id"],
            browseField: req.query["_field"],
            bookTitle:req.query["_bookTitle"],
            browseKey: req.query[req.query["_field"]],
            books:books
        });
    });
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
