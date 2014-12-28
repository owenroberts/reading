var mongodb = require('mongodb'), 
    MongoClient = require('mongodb').MongoClient, 
    Db = require('mongodb').Db, 
    Connection = require('mongodb').Connection, 
    Server = require('mongodb').Server, 
    BSON = require('mongodb').BSON, 
    ObjectID = require('mongodb').ObjectID;


BookProvider = function(uri) {
  
  
  var that = this;
  mongodb.MongoClient.connect(uri, { server: { auto_reconnect: true } }, function (error, database) {
    if (error) console.log(error);
    that.db = database;
  });
  
  /*
   TO DEVELOP LOCALLY 
      uncomment the following two lines
      comment out the beginning of this function
  */

  //this.db = new Db('books', new Server('localhost', 27017, {safe: false}, {auto_reconnect: true}, {}));
  //this.db.open(function(){});
};

//initialize info values
BookProvider.prototype.init = function(info, callback) {
  this.getCollection(function(error, book_collection) {
    if ( error ) callback(error);
    else {
      book_collection.insert({info:info}, function(error){
        if (error) callback(error);
        else callback(null);
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


BookProvider.prototype.getCollection = function(callback) {
  this.db.collection('bks', function(error, book_collection) {
    if( error ) callback(error);
    else callback(null, book_collection);
  });
};

//find all books
BookProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, book_collection) {
      if( error ) callback(error);
      else {
        book_collection.find().toArray(function(error, results) {
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

//find recently edited books
BookProvider.prototype.findRecentEdits = function(callback) {
    this.getCollection(function(error, book_collection) {
      if( error ) callback(error);
      else {
        book_collection.find().sort({last_edit:-1}).limit(8).toArray(function(error, results) {
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};
//find recently logged books
BookProvider.prototype.findRecentLogs = function(callback) {
    this.getCollection(function(error, book_collection) {
      if( error ) callback(error);
      else {
        book_collection.find().sort({created_at:-1}).limit(8).toArray(function(error, results) {
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

//find subset of books with tag 
BookProvider.prototype.findTag = function(tag, callback) {
  this.getCollection(function(error, book_collection) {
    if(error) callback(error);
    else {
      book_collection.find({tags:tag}).toArray(function(error, results){
        if (error) callback(error);
        else callback(null, results);
      });
    }
  });
};

//search all books
BookProvider.prototype.search = function(query, callback) {
  var name = query._field;
  var value = query._query;
  var dbQuery = {};
  dbQuery[name] = {$regex:value, $options:"-i"};
  this.getCollection(function(error, book_collection) {
      book_collection.find(dbQuery).toArray(function(error, results){
        if (error) callback(error);
        else callback(null, results);
      });
  });
};

//search books and return subset based on a feild and query (_ref)
BookProvider.prototype.searchRefs = function(query, callback) {
  var name = query._field;
  var value = query._ref;
  var dbQuery = {};
  if (query._refs != undefined) {
    var exclude = query._refs;
    if (exclude.constructor == Array) {
      for (var i = 0; i < exclude.length; i++) {
        var obj = new ObjectID(exclude[i]);
        exclude[i] = obj;
      }
      dbQuery = {_id:{$nin:exclude}};
    } else {
      exclude = new ObjectID(exclude);
      dbQuery = {_id:{$ne:exclude}};
    }
  }
  dbQuery[name] = {$regex:value, $options:"-i"};
  console.log(JSON.stringify(dbQuery));
  this.getCollection(function(error, book_collection) {
      book_collection.find(dbQuery).toArray(function(error, results){
        if (error) callback(error);
        else callback(null, results);
      });
  });
};



//search books and return subset based on a feild and query (_ref)
BookProvider.prototype.browseRefs = function(query, callback) {
  var dbQuery = {};
  var f = query._field;
  var q = query[query._field];
  if (f == "_fields") {
      dbQuery[query[query._field]] = {$exists:true};
  } else if (query._field == "_types") {
    dbQuery = {type:q};
  } else if (f == "_tags") {
    dbQuery = {tags:{$in:[q]}};
  }
  if (query._refs != undefined) {
    var exclude = query._refs;
    if (exclude.constructor == Array) {
      for (var i = 0; i < exclude.length; i++) {
        var obj = new ObjectID(exclude[i]);
        exclude[i] = obj;
      }
      dbQuery = {_id:{$nin:exclude}};
    } else {
      exclude = new ObjectID(exclude);
      dbQuery = {_id:{$ne:exclude}};
    }
  }
  console.log(dbQuery);
  this.getCollection(function(error, book_collection) {
      book_collection.find(dbQuery).toArray(function(error, results){
        if (error) callback(error);
        else callback(null, results);
      });
  });
};
//search books and return subset based on a feild and query (_ref)
BookProvider.prototype.browse = function(query, callback) {
  var dbQuery = {};
  var f = query._field;
  var q = query[query._field];
  if (f == "_fields") {
      dbQuery[query[query._field]] = {$exists:true};
  } else if (query._field == "_types") {
    dbQuery = {type:q};
  } else if (f == "_tags") {
    dbQuery = {tags:{$in:[q]}};
  }
  console.log(dbQuery);
  this.getCollection(function(error, book_collection) {
      book_collection.find(dbQuery).toArray(function(error, results){
        if (error) callback(error);
        else callback(null, results);
      });
  });
};

// get references from single book to display query from id 
BookProvider.prototype.getRefs = function(refs, callback) {
  var query = {_id:{$in:[]}};
  for (var i = 0; i < refs.length; i++) {
    var objId = new ObjectID(refs[i].refId);
    query._id["$in"].push(objId);
  }
  this.getCollection(function(error, book_collection) {
      book_collection.find(query).toArray(function(error, results){
        if (error) callback(error);
        else callback(null, results);
      });
  });
};

//save new book
BookProvider.prototype.save = function(books, callback) {
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

BookProvider.prototype.addType = function(type, callback) {
  this.getCollection(function(error, book_collection) {
    if (error) callback(error);
    else {
      book_collection.update({info:{$exists:true}}, {$addToSet:{"info._types":type}}, 
        function (error) {
          console.log(error);
        });
    }
  });
};

// find a book by id
BookProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, book_collection) {
    if (error) callback(error);
    else {
      book_collection.findOne({info:{$exists:true}}, function(error, info) {
          book_collection.findOne({_id:book_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
            if (error) callback(error);
            else callback(null, result, info);
        });
      });
    }
  });
};

// get info 
BookProvider.prototype.getInfo = function(callback) {
  this.getCollection(function(error, book_collection) {
    if (error) callback(error);
    else {
      book_collection.findOne({info:{$exists:true}}, function(error, info) {
          if (error) callback(error);
          else callback(null, info);
      });
    }
  });
};

// add a tag
BookProvider.prototype.addTag = function(query, set) {
  this.getCollection(function(error, book_collection) {
    if (error) console.log("add tag: " + error);
    else book_collection.update(query, set);
  });
};

// referenced by add note 
BookProvider.prototype.addReferencedBy = function(refId, id, title, note) {
  var query = {_id:new ObjectID(refId)};
  var set = { referencedBy: {}};
  set["referencedBy"] = {id:id, note:note, title:title};
  this.getCollection(function(error, book_collection){
    if (error) console.log(error);
    else {
      book_collection.update(query, {$addToSet:set}, function(error){
        if (error) console.log("addReferencedBy: " + error);
      });
    }
  });
};
// edit referenced by 
BookProvider.prototype.editReferencedBy = function(refId, id, title, note) {
  var query = {_id:new ObjectID(refId), referencedBy:{$elemMatch:{id:id}}};
  var set = {};
  set["referencedBy.$.note"] = note;
  this.getCollection(function(error, book_collection){
    if (error) console.log("edit ref by: " + error);
    else {
      book_collection.update(query, {$set:set}, function(error) {
        console.log("edit ref by: " + error);
      });
    }
  });
};
// edit reference
BookProvider.prototype.editRef = function(refId, id, title, note) {
  var query = {_id:new ObjectID(refId), refs:{$elemMatch:{id:id}}};
  var set = {};
  set["refs.$.note"] = note;
  this.getCollection(function(error, book_collection){
    if (error) console.log("editRef: " + error);
    else {
      book_collection.update(query, {$set:set}, function(error){
        console.log("edit ref: " + error);
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






exports.BookProvider = BookProvider;