var express = require('express')
	,	path = require('path')
	,	BookProvider = require('./bookprovider').BookProvider
	,	logger = require('morgan')
	,	cookieParser = require('cookie-parser')
	,	bodyParser = require('body-parser')
	,	cookies = require('browser-cookies')
	,	handlebars = require("express-handlebars")
	;

var app = express();


const hbs = handlebars.create({
	defaultLayout: "main",
	helpers: {
		json: function(content) {
			return JSON.stringify(content);
		},
		date: function(dateString) {
			return dateString.getMonth() + 1 + " " + dateString.getDate() + " " + dateString.getFullYear();
		},
		idString: function(id) {
			return id.toHexString();
		},
		refIsBook: function(ref, id) {
			return ref == id.toHexString();
		}
	}
});

// view engine setup
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
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
		readdate: req.param('readdate')
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
			bookProvider.getRefs(req.params.id, function(error, refs) {
				if (error) console.log(error);
				else {
					res.render('edit', {
						referer: req.get('referer'),
						book: book,
						info: info,
						title: book.title,
						refs: refs
					});
				}
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

\


// get all tags
app.get('/tag/:tag', function(req, res) {
	bookProvider.findTag(req.params.tag, function(error, books) { 
		res.render('search', {
			books: books,
			title: "tagged " + req.params.tag,
			search_term: "Tagged",
			referer: req.get('referer')
		});
	});
});

// add new reference 
app.post('/addref', function(req, res) {
	var ref = {
		src_id: req.param('src_id'),
		src_title: req.param('src_title'),
		ref_id: req.param('ref_id'),
		ref_title: req.param('ref_title'),
		note: req.param('note')
	};
	bookProvider.addRef(ref, function(error, result) {
		if (error) console.log(error);
		else {
			console.log(result);
			res.redirect('/book/'+ref.src_id+'/edit');
		}
	});
});

//get references query 
app.get('/addref/search', function(req, res) {
	bookProvider.searchRefs(req.query, function(error, books) { 
		res.render('refs', {
            referer: req.get('referer'),
			bookId:req.query["_id"],
			bookTitle:req.query["_bookTitle"],
			searchKey: req.query["_field"] + ": " + req.query["_ref"],
			books:books
		});
	});
});

//get references browse 
app.get('/addref/browse', function(req, res) {
	bookProvider.browseRefs(req.query, function(error, books) { 
		res.render('refs', {
            referer: req.get('referer'),
			bookId:req.query["_id"],
			bookTitle:req.query["_bookTitle"],
			browseField: req.query["_field"],
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

app.listen(port, function() {
    console.log("App running on port", port);
});
module.exports = app;

/*
https://community.c9.io/t/setting-up-mongodb/1717
*/