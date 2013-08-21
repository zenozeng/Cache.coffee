// Generated by CoffeeScript 1.6.1
/*
Cache.coffee

Licensed under The MIT License.

Copyright (C) 2013 Zeno Zeng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Cache;

Cache = (function() {
  /*
  Constructor
  
  @example Constructor
     cache = new Cache {prefix: "myprefix_"}
  
  @param [Object] opts config options
  */

  function Cache(opts) {
    var defaults;
    this.events = {};
    this.tmp = {};
    this.queue = {};
    defaults = {
      prefix: 'myCachePrefix_'
    };
    this.opts = _.extend(defaults, opts);
    this.debug = opts.debug ? opts.debug : false;
    this.storage = null;
    if ((typeof $ !== "undefined" && $ !== null) && ($.jStorage != null)) {
      this.storage = {
        backend: 'jStorage',
        keys: $.jStorage.index,
        getItem: $.jStorage.get,
        setItem: $.jStorage.set,
        removeItem: $.jStorage.deleteKey
      };
    }
    if (window.localStorage != null) {
      this.storage = {
        backend: 'localStorage',
        keys: function() {
          var key, keys;
          keys = [];
          for (key in window.localStorage) {
            keys.push(key);
          }
          return keys;
        },
        getItem: function(key) {
          return window.localStorage.getItem(key);
        },
        setItem: function(key, value) {
          return window.localStorage.setItem(key, value);
        },
        removeItem: function(key) {
          return window.localStorage.removeItem(key);
        }
      };
    }
  }

  /*
  Trigger event
  
  @param [String] event event name
  @param [Object] args event args
  */


  Cache.prototype.trigger = function(event, args) {
    var callback, _i, _len, _ref, _results;
    if (this.events[event] != null) {
      _ref = this.events[event].callbacks;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback(args));
      }
      return _results;
    }
  };

  /*
  Attach callback on data event
  
  @param [String] event event name
  @param [Function] callback function to handle event
  */


  Cache.prototype.on = function(event, callback) {
    if (this.events[event] == null) {
      this.events[event] = {
        callbacks: []
      };
    }
    return this.events[event].callbacks.push(callback);
  };

  /*
  Get data, return from cache first, and update it in the background
  
  @example Get Data
    cache = new Cache {prefix: "myprefix_"}
    cache.get
      id: 'post-123'
      fetch: (success, error) ->
        $.ajax {url: 'http://eample.com/abc', success: success, error: error}
      parse: (data) ->
        JSON.parse data
      validate: (data) ->
        data.status is 'ok'
      # tell whether should update data in the background, could be true || false || function 
      update: () ->
        lastModified > lastUpdated
      updateAfter: (callback) ->
        data.ready(callback)
      success: successCallback
      error: errorCallback
  
  @param [Object] args data args
  */


  Cache.prototype.get = function(args) {
    var id, storageItem, success, update, updateAfter,
      _this = this;
    args.id = this.opts.prefix + args.id;
    id = args.id, update = args.update, updateAfter = args.updateAfter, success = args.success;
    if (this.tmp[id] != null) {
      if (this.debug) {
        console.log("RAM::" + id);
      }
      return typeof success === "function" ? success(this.tmp[id]) : void 0;
    } else {
      storageItem = (function() {
        var data;
        if (_this.storage != null) {
          data = _this.storage.getItem(id);
          if (data != null) {
            try {
              data = JSON.parse(data);
            } catch (e) {
              return false;
            }
            if ((data != null) && (data.timestamp != null) && (data.data != null)) {
              return data.data;
            }
          }
        }
        return false;
      })();
      if (storageItem) {
        if (this.debug) {
          console.log("Storage::" + id);
        }
        if (typeof success === "function") {
          success(storageItem);
        }
        args.success = null;
        if (update == null) {
          update = true;
        }
        if (updateAfter != null) {
          return updateAfter(function() {
            if (typeof update === 'function') {
              update = update();
            }
            if (!update) {
              return;
            }
            if (_this.debug) {
              console.log("Update(With Delay)::" + id);
            }
            return _this.fetch(args);
          });
        } else {
          if (typeof update === 'function') {
            update = update();
          }
          if (update) {
            if (this.debug) {
              console.log("Update(Now)::" + id);
            }
            return this.fetch(args);
          }
        }
      } else {
        return this.fetch(args);
      }
    }
  };

  /*
  Return last update timestamp of cache (microtime)
  
  @param [String] id cache id
  @return [Interger] time stamp
  */


  Cache.prototype.timestamp = function(id) {
    var data;
    id = this.opts.prefix + id;
    if (this.storage != null) {
      data = this.storage.getItem(id);
      data = JSON.parse(data);
      if ((data != null) && (data.timestamp != null) && (data.data != null)) {
        return data.timestamp;
      }
    }
    return 0;
  };

  /*
  Fetch data, and update it in the background
  
  @example Fetch Data
    cache = new Cache {prefix: "myprefix_"}
    cache.fetch
      id: 'post-123'
      fetch: (success, error) ->
        $.ajax {url: 'http://eample.com/abc', success: success, error: error}
      parse: (data) ->
        JSON.parse data
      validate: (data) ->
        data.status is 'ok'
      # tell whether should update data in the background, could be true || false || function 
      update: () ->
        lastModified > lastUpdated
      success: successCallback
      error: errorCallback
  
  @param [Object] args data args
  */


  Cache.prototype.fetch = function(args) {
    var callback, error, fetch, fetchSuccess, id, parse, success, validate,
      _this = this;
    id = args.id, fetch = args.fetch, parse = args.parse, validate = args.validate, success = args.success, error = args.error;
    if (!parse) {
      parse = function(data) {
        return data;
      };
    }
    if (!validate) {
      validate = function(data) {
        return true;
      };
    }
    if (!error) {
      error = function(e) {
        if (_this.debug) {
          return console.log(e);
        }
      };
    }
    if (this.queue[id]) {
      if (this.debug) {
        console.log("Queue::" + id);
      }
      callback = _.once(success);
      return this.on('load', function(e) {
        if (e.id === id) {
          return callback(e.data);
        }
      });
    } else {
      if (this.debug) {
        console.log("Fetch::" + id);
      }
      this.queue[id] = true;
      fetchSuccess = function(data) {
        data = parse(data);
        if (validate(data)) {
          _this.save(id, data);
          _this.queue[id] = false;
          _this.trigger('load', {
            id: id,
            data: data
          });
          return typeof success === "function" ? success(data) : void 0;
        } else {
          return error({
            name: 'DATA_INVALID_ERR'
          });
        }
      };
      return fetch(fetchSuccess, error);
    }
  };

  /*
  Save data to cache
  
  @param [String] id data's Cache ID
  @param [Object] data data
  */


  Cache.prototype.save = function(id, data) {
    if (this.debug) {
      console.log("Save::" + id);
    }
    this.tmp[id] = data;
    data = {
      timestamp: (new Date()).getTime(),
      data: data
    };
    data = JSON.stringify(data);
    if (this.storage != null) {
      try {
        this.storage.setItem(id, data);
      } catch (e) {
        if (e.name === 'QUOTA_EXCEEDED_ERR') {
          this.clear();
          try {
            this.storage.setItem(id, data);
          } catch (e) {
            false;
          }
        }
      }
      if (this.storage.backend === 'jStorage') {
        if (this.storage.getItem(id) == null) {
          this.clear();
          return this.storage.setItem(id, data);
        }
      }
    }
  };

  /*
  Clear all storage items with prefix
  */


  Cache.prototype.clear = function() {
    var key, _i, _len, _ref, _results;
    _ref = this.storage.keys();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (key.indexOf(this.opts.prefix === 0)) {
        _results.push(this.storage.removeItem(key));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Cache;

})();
