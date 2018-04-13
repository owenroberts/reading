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
	this.getInfoCollection(function(error, info_collection) {
		if ( error ) callback(error);
		else {
			info_collection.insert([
					{types: info.types},
					{fields: info.fields},
					{tags:[]}
				], function(error){
				if (error) callback(error);
				else callback(null);
			});
		}
	});
};

// get info 
BookProvider.prototype.getInfo = function(callback) {
	this.getCollection(function(error, info_collection) {
		if (error) callback(error);
		else {
			info_collection.findOne({info:{$exists:true}}, function(error, info) {
				if (error) callback(error);
				else callback(null, info);
			});
		}
	});
};

// get info types 
BookProvider.prototype.getInfoTypes = function(callback) {
	this.getInfoCollection(function(error, info_collection){
		if (error) callback(error);
		else {
			info_collection.findOne({types:{$exists:true}}, function(error, types) {
				if (error) callback(error);
				else callback(null, types);
			});
		}
	});
};

// get info tags 
BookProvider.prototype.getInfoTags = function(callback) {
	this.getInfoCollection(function(error, info_collection){
		if (error) callback(error);
		else {
			info_collection.findOne({tags:{$exists:true}}, function(error, tags) {
				if (error) callback(error);
				else callback(null, tags);
			});
		}
	});
};

// add type
BookProvider.prototype.addType = function(type, callback) {
	this.getInfoCollection(function(error, info_collection) {
		if (error) callback(error);
		else {
			info_collection.update({types:{$exists:true}}, {$push:{"types":type}},
				function (error) {
					console.log(error);
				}
			);
		}
	});
};

// add type
BookProvider.prototype.addTag = function(tag, callback) {
	this.getInfoCollection(function(error, info_collection) {
		if (error) callback(error);
		else {
			info_collection.update({tags:{$exists:true}}, {$addToSet:{"tags":tag}},
				function (error) {
					console.log(error);
				}
			);
		}
	});
};


// gets bks collection
BookProvider.prototype.getCollection = function(callback) {
	this.db.collection('bks', function(error, book_collection) {
		if( error ) callback(error);
		else callback(null, book_collection);
	});
};

// get info collection
BookProvider.prototype.getInfoCollection = function(callback) {
	this.db.collection('info', function(error, book_collection) {
		if( error ) callback(error);
		else callback(null, book_collection);
	});
};

// get ref collection
BookProvider.prototype.getRefCollection = function(callback) {
	this.db.collection('refs', function(error, ref_collection) {
		if (error) callback(error);
		else callback(null, ref_collection);
	});
};

// add ref
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

// get refs
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

// find all books
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

// find recently edited books
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

// find recently logged books
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

// find subset of books with tag 
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

// search all books
BookProvider.prototype.search = function(query, callback) {
	var name = query.field;
	var value = query.query;
	var dbQuery = {};
	dbQuery[name] = {$regex:value, $options:"-i"};
	this.getCollection(function(error, book_collection) {
		book_collection.find(dbQuery).toArray(function(error, results){
			if (error) callback(error);
			else callback(null, results);
		});
	});
};

// search books and return subset based on a feild and query (_ref)
BookProvider.prototype.searchRefs = function(query, callback) {
	var name = query.field;
	var value = query.ref;
	var dbQuery = {};
	if (query.refs != undefined) {
		var exclude = query.refs;
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

// search books and return subset based on a feild and query (_ref)
BookProvider.prototype.browseRefs = function(query, callback) {
	var dbQuery = {};
	var f = query.field;
	var q = query[query.field];
	if (query.field == "types") {
		dbQuery = {type:q};
	} else if (f == "tags") {
		dbQuery = {tags:{$in:[q]}};
	}
	if (query.refs != undefined) {
		var exclude = query.refs;
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

// search books and return subset based on a feild and query (_ref)
BookProvider.prototype.browse = function(query, callback) {
	var dbQuery = {};
	var f = query.field;
	var q = query[query.field];
	if (f == "fields") {
		dbQuery[query[query._field]] = {$exists:true};
	} else if (query.field == "types") {
		dbQuery = {type:q};
	} else if (f == "tags") {
		dbQuery = {tags:{$in:[q]}};
	}
	this.getCollection(function(error, book_collection) {
		book_collection.find(dbQuery).toArray(function(error, results){
			if (error) callback(error);
			else callback(null, results);
		});
	});
};

// save new book
BookProvider.prototype.save = function(books, callback) {
	this.getCollection(function(error, book_collection) {
		if ( error ) callback(error)
		else {
			if (typeof(books.length)=="undefined")
				books = [books];
			for (let i =0; i < books.length; i++) {
			  book = books[i];
			  book.created_at = new Date();
			}

			book_collection.insert(books, function() {
				callback(null, books);
			});
		}
	});
};

// delete book
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

// find a book by id
BookProvider.prototype.findById = function(id, callback) {
	this.getCollection(function(error, book_collection) {
		if (error) callback(error);
		else {
			book_collection.findOne({_id:ObjectID.createFromHexString(id)}, function(error, result) {
				if (error) callback(error);
				else callback(null, result);
			});
		}
	});
};


// update one parameter
BookProvider.prototype.updateParam = function(bookId, param, edit, arrayIndex, callback) {
	if (param == "tags") {
		this.addTag(edit);
	}
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
  	});
};


exports.BookProvider = BookProvider;