var express = require('express')
	,	path = require('path')
	,	BookProvider = require('./bookprovider').BookProvider
	,	logger = require('morgan')
	,	cookieParser = require('cookie-parser')
	,	bodyParser = require('body-parser')
	,	cookies = require('browser-cookies')
	;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.set('view options', {layout: false});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	bookProvider.findRecentEdits(function(error, edits) {
		bookProvider.findRecentLogs(function(error, logs) {
			bookProvider.getInfo(function(error, info) {
				res.render('index', {
					title:"Reading",
					info:info,
					recentlyEdited:edits,
					recentlyLogged:logs
				});
			});
		});
	});
});

app.get('/init', function(req, res) {
	res.render('init');
});

app.post('/init', function(req, res) {
    bookProvider.init(
        {
            "_atts" : [ "quote", "note", "link", "tag" ],
            "_types" : [ "book", "article", "film/movie", "art", "comix", "game" ],
            "_fields" : [ "title", "name", "type", "genre", "pubdate", "readdate", "quotes", "notes", "links", "tags", "refs" ]
        },
        function(error, docs) {
            res.redirect('/');
        }); 
});

//get references browse 
app.get('/browse', function(req, res) {
    bookProvider.browse(req.query, function(error, books) { 
        res.render('search', {
            books:books,
            title: "Browse " + req.query["_field"] + ", " + req.query[req.query["_field"]]
        });
    });
});


// search all of the books
app.get('/search', function(req, res) {
    bookProvider.search(req.query, function(error, books) {
        res.render('search', {
            bookId:req.query["_id"],
            books:books,
            title: "Search " + req.query["_field"] + ": " + req.query["_query"]
        });
    });
});

// create a book
app.get('/book/new', function(req, res) {
    bookProvider.getInfo(function(error, info) {
        res.render('new', {
            info:info,
            title: 'New Book'
        });
    });
});

// saves created book
app.post('/book/new', function(req, res){
    if (req.body.newtype != undefined) {
        bookProvider.addType(req.body.type);
    }
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
    bookProvider.findById(req.params.id, function(error, book, info) { 
        if (book == null) {
            console.log("book is null");
            res.redirect('/404');
        } else {
            res.render('edit', {
                referer: req.get('referer'),
                book: book,
                info: info,
                title: book.title
            });
        }

    });
});

// update a parameter
app.post('/param/:id', function(req, res) {
    bookProvider.updateParam(req.body.id, req.body.param, req.body.edit, req.body.arrayIndex,  function(error, result) {
        if (error) console.log(error);
        else res.json({ data: result });
    });
});

app.get('/404', function(req, res) {
    res.render('404');
});

// save book
app.post('/book/:id/edit', function(req, res) {
    var editedBook = {};
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
                editedBook["$addToSet"] = {'refs': {id:req.body["_refId"], note:req.body["_refNote"], title:req.body["_refTitle"]}};
                bookProvider.addReferencedBy(req.body["_refId"], req.body["_id"], req.body["_title"],  req.body["_refNote"]);
            } else if (item == '_editRef') {
                bookProvider.editRef(req.body["_id"], req.body["_editRef"], req.body["_title"],  req.body["_refNote"]);
                bookProvider.editReferencedBy(req.body["_editRef"], req.body["_id"], req.body["_title"],  req.body["_refNote"]);
            } 
            else if (item[0] == "+"){
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
    if (Object.getOwnPropertyNames(editedBook).length > 0) {
        if (editedBook["$set"] != undefined) {
            editedBook["$set"]["last_edit"] = new Date();
        } else {
            editedBook["$set"] = {};
            editedBook["$set"]["last_edit"] = new Date();
        }
        bookProvider.update(req.param('_id'), editedBook, function(error, docs) {
            res.redirect('/book/'+req.body._id+'/edit');
        });
    } else {
        res.redirect(req.get('referer'));
    }
});


// get all tags
app.get('/tag/:tag', function(req, res) {
	bookProvider.findTag(req.params.tag, function(error, books) { 
		res.render('search', {
			books: books,
			title: req.params.tag,
			search_term: "Tagged",
			referer: req.get('referer')
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
app.get('/delete/:id', function(req, res) {
	bookProvider.delete(req.params.id, function(error, docs) {
		res.redirect('/')
	});
});

var port = process.env.PORT || 3000;
var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'localhost';
var bookProvider = new BookProvider(mongoUri);

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

app.listen(port);
module.exports = app;

/*
https://community.c9.io/t/setting-up-mongodb/1717
*/