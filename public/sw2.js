(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      request.onupgradeneeded = function(event) {
        if (upgradeCallback) {
          upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
        }
      };

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

},{}],2:[function(require,module,exports){
    var CACHE_NAME = "newsAPI_cache_v2";
    var idb = require('idb');
    var urlsToCache = [
        '/',
        '/common/modules/posts.js',
        '/admin/css/main.css',
        '/admin/js/searchbox.js',
        '/admin/js/lib/markdown.js',
        '/admin/js/controllers.js',
        '/admin/js/app.js',
        '/admin/templates/nav.html',
        '/admin/templates/allPosts.html',
        'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.15/angular-ui-router.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.2/angular-sanitize.js',
        'https://cdn.rawgit.com/showdownjs/showdown/1.0.2/dist/showdown.min.js'
    ];
    self.addEventListener('install', function (event){
	    event.waitUntil(
		    caches.open(CACHE_NAME).then(function(cache){
			    console.log('cache opened');
			    return cache.addAll(urlsToCache);
		    })
	    );
    });
    function idbMs(source) {
        //source = source || 0;

        var idb = require('idb');
        var dbPromise = idb.open('newsAPI', 2);
        return dbPromise.then(function (db) {
            var tx = db.transaction('newsAPI').objectStore('newsAPI').index('by-source');
            if (source == undefined) {
                return tx.getAll().then(function (message) {
                    //console.log(message);
                    return message;
                });
            }
            return tx.getAll(source).then(function(message){
                //console.log(message);
                return message;
            });
        });
    }
    function favorite() {
        var idb = require('idb');
        var dbPromise = idb.open('newsAPI', 2);
        return dbPromise.then(function (db) {
            var tx = db.transaction('favorite').objectStore('favorite');
            return tx.getAll().then(function(message){
                //console.log(message);
                return message;
            });
        });
    }

    self.addEventListener('fetch', function (event) {
        //console.log(event.request);
        console.log(event.request.url);
        event.respondWith(
            //new Response("Hello world")
        
            caches.match(event.request).then(function (response) {
                //serve from cache
                if (response) {
                    console.log('fetching from cache: ', response.url);
                    return response;
                }

                //check for favorites
                
                var fetchRequest = event.request.clone();
                
                
                //fetch the request and check response for offline status

                return fetch(fetchRequest).then(function (response) {
                    //check if client is requesting for sources
                    
                    //console.log(fetchRequest.url);
                    //CHECK IF THE SERVER CANNOT CONNECT TO NEWSAPI
                    if (fetchRequest.url.startsWith('http://localhost:3000/api/sources') && response.status == 404) {
                        var url = fetchRequest.url;
                        var source = url.slice(url.lastIndexOf('/') + 1);
                        return idbMs(source).then(function (news) {
                            return new Response(JSON.stringify(news));
                        
                        });
                    } 
                    if (fetchRequest.url.startsWith('http://localhost:3000/api/posts') && response.status == 404) {
                        
                        console.log(fetchRequest.url);
                        
                        return idbMs().then(function (news) {
                            return new Response(JSON.stringify(news));
                      
                        });
                    }  

                    if (fetchRequest.url=='http://localhost:3000/api/favourite/'){

                    //fetch data from favorite store
                    //console.log('handle');
                      return favorite().then(function (news) {
                          return new Response(JSON.stringify(news));
                      });

                    } 

                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME).then(function (cache) {
                        //cache.put(event.request, responseToCache);
                    })
                    //console.log(responseToCache);
                    return response;
                }).catch(function (err){
                    //NOT CONNECTED TO SERVER
                    if (fetchRequest.url.startsWith('http://localhost:3000/api/sources')) {
                        var url = fetchRequest.url;
                        var source = url.slice(url.lastIndexOf('/') + 1);
                        return idbMs(source).then(function (news) {
                            return new Response(JSON.stringify(news));
                        
                        });
                    } 
                    if (fetchRequest.url.startsWith('http://localhost:3000/api/posts')) {
                        
                        console.log(fetchRequest.url);
                        
                        return idbMs().then(function (news) {
                            return new Response(JSON.stringify(news));
                      
                        });
                    } 

                    if (fetchRequest.url=='http://localhost:3000/api/favourite/'){

                    //fetch data from favorite store
                    //console.log('handle');
                      return favorite().then(function (news) {
                          return new Response(JSON.stringify(news));
                      });

                    } 

                });
            }) 
        ) 
    })
   
},{"idb":1}]},{},[2]);
