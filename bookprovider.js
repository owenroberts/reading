var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

BookProvider = function(host, port) {
  this.db= new Db('node-mongo-book', new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


BookProvider.prototype.getCollection= function(callback) {
  this.db.collection('books', function(error, book_collection) {
    if( error ) callback(error);
    else callback(null, book_collection);
  });
};

//find all books
BookProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, book_collection) {
      if( error ) callback(error)
      else {
        book_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//save new book
BookProvider.prototype.save = function(books, callback) {
    console.log(books);
    this.getCollection(function(error, book_collection) {
      if( error ) callback(error)
      else {
        if( typeof(books.length)=="undefined")
          books = [books];

        for( var i =0;i< books.length;i++ ) {
          book = books[i];
          book.created_at = new Date();
        }

        book_collection.insert(books, function() {
          callback(null, books);
        });
      }
    });
};

// find a book by id
BookProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, book_collection) {
    if (error) callback(error);
    else {
      book_collection.findOne({_id:book_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
        if (error) callback(error);
        else callback(null, result);
      });
    }
  });
};

// update a book
BookProvider.prototype.update = function(bookId, books, callback) {
  this.getCollection(function(error, book_collection) {
    if (error) callback(error);
    else {
       book_collection.update( 
          {_id:book_collection.db.bson_serializer.ObjectID.createFromHexString(bookId)},
          books,
          function(error, books) {
            if (error) callback(error);
            else callback(null, books);
          });
    }
  });
};

//delete book
BookProvider.prototype.delete = function(bookId, callback) {
        this.getCollection(function(error, book_collection) {
                if(error) callback(error);
                else {
                        book_collection.remove(
                                {_id: book_collection.db.bson_serializer.ObjectID.createFromHexString(bookId)},
                                function(error, book){
                                        if(error) callback(error);
                                        else callback(null, book)
                                });
                        }
        });
};




exports.BookProvider = BookProvider;