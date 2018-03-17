var mongodb = require('mongodb'), 
	MongoClient = require('mongodb').MongoClient, 
	Db = require('mongodb').Db, 
	Connection = require('mongodb').Connection, 
	Server = require('mongodb').Server, 
	BSON = require('mongodb').BSON, 
	ObjectID = require('mongodb').ObjectID
	;


BookProvider = function(uri) {
	if (uri == "localhost") {
		const server = new Server('localhost', 27017, {safe:false}, {auto_reconnect:true}, {});
		this.db = new Db('books', server);
		this.db.open(function(){});
	} else {
		var that = this;
		mongodb.MongoClient.connect(uri, { server: { auto_reconnect: true } }, function (error, database) {
			if (error) console.log(error);
			that.db = database;
		});
	}	
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

BookProvider.prototype.getCollection = function(callback) {
	this.db.collection('bks', function(error, book_collection) {
		if( error ) callback(error);
		else callback(null, book_collection);
	});
};

// add ref 
BookProvider.prototype.getRefCollection = function(callback) {
	this.db.collection('refs', function(error, ref_collection) {
		if (error) callback(error);
		else callback(null, ref_collection);
	});
};

BookProvider.prototype.addRef = function(ref, callback) {
	this.getRefCollection(function(error, ref_collection) {
		if (error) callback(error);
		else {
			ref.created_at = new Date();
			ref_collection.insert(ref, function(){
				callback(null, ref);
			})
		}
	});
};

BookProvider.prototype.getRefs = function(id, callback) {
	this.getRefCollection(function(error, ref_collection) {
		if (error) callback(error);
		else {
			var or = {
				'$or': [
					{'src_id': id},
					{'ref_id': id}
				]
			}
			ref_collection.find(or).toArray(function(error, refs)  {
				if (error) console.log(error);
				else callback(null, refs);
			});
		}
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
			book_collection.find().sort({last_edit:-1}).limit(4).toArray(function(error, results) {
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
			book_collection.find().sort({created_at:-1}).limit(4).toArray(function(error, results) {
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
	this.getCollection(function(error, book_collection) {
		book_collection.find(dbQuery).toArray(function(error, results){
			if (error) callback(error);
			else callback(null, results);
		});
	});
};

//save new book
BookProvider.prototype.save = function(books, callback) {
	this.getCollection(function(error, book_collection) {
		if ( error ) callback(error)
		else {
			if (typeof(books.length)=="undefined")
				books = [books];
			for (var i =0;i< books.length;i++ ) {
			  book = books[i];
			  book.created_at = new Date();
			}

			book_collection.insert(books, function() {
				callback(null, books);
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
			{_id:ObjectID.createFromHexString(bookId)},
			function(error, book){
				if(error) callback(error);
				else callback(null, book)
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
				}
			);
		}
	});
};

// find a book by id
BookProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(error, book_collection) {
		if (error) callback(error);
		else {
			book_collection.findOne({info:{$exists:true}}, function(error, info) {
				book_collection.findOne({_id:ObjectID.createFromHexString(id)}, function(error, result) {
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


// update a book
BookProvider.prototype.update = function(bookId, books, callback) {
	this.getCollection(function(error, book_collection) {
		if (error) callback(error);
		else {
			book_collection.update( 
		    	{_id:ObjectID.createFromHexString(bookId)},
		    	books,
		    	function(error, books) {
		    	  if (error) callback(error);
		    	  else callback(null, books);
		    });
		}
	});
};

// update one parameter
BookProvider.prototype.updateParam = function(bookId, param, edit, arrayIndex, callback) {
	this.getCollection(function(error, book_collection) {
		if (error) callback(error);
		else {
			var updateValue = {};
			if (arrayIndex == -1) {
				if (param == "links") updateValue[param] = [edit.split(',')[0], edit.split(',')[1]];
				else updateValue[param] = edit;
				book_collection.update(
					{_id:ObjectID.createFromHexString(bookId)},
					{$push:updateValue}
				);
			} else {
			    if (arrayIndex >= 0) updateValue[param+"."+arrayIndex] = edit;
			    else updateValue[param] = edit;
			    book_collection.update(
			    	{_id:ObjectID.createFromHexString(bookId)}, 
			    	{$set:updateValue}
			    );
			}
			book_collection.update(
				{_id:ObjectID.createFromHexString(bookId)},
				{$set:{"last_edit": new Date() } }
			);
			callback(null, "Success");
    	}
  	})
};


exports.BookProvider = BookProvider;