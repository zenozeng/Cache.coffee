# Cache.coffee

Cache.coffee is a library written for data caching.
Like HTML5's appcache, it saves data at first request, and when request again it returns the data cached and update in the background.
As for backend, it uses localStorage (or jStorage unless localStorage is available)

```CoffeeScript
Data Request ->
    if Cache in RAM
        Return Data
    else
        if Cache in Storage
            Return Data
            Update In the background
        else
            if Already In Request Queue
                Wait until event fires
            else
                Fetch Data
```

## Requement

- underscore.js

## License

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

## Document

### Cache.get()

- id

    [String] Cache ID

- fetch

    [Function] function to fetch data

    Example: 

    ```Javascript
    fetch = function(success, error) {
        $.ajax({
            url: 'http://example.com/abc.json',
            success: success,
            error: error
        });
    }
    ```

- parse

    [Function] function to parse data fetched

    Default:

    ```javascript
    parse = function(data) {
        return data;
    }
    ```

- validate

    [Function] function to validate data parsed
    
    Default:

    ```Javascript
    validate = function(data) {
        return true;
    }
    ```

- update

    [Function] function returning true or false, update data if true

    Example:

    ```Javascipt
    update = function() {
        if((new Date()).getTime() - lastUpdate > 1000) {
            return true;
        } else {
            return false;
        }
    }
    ```

- updateAfter

    [Function] accepts an arg for callback

    Example:

    ```Javascipt
    updateAfter = function(callback) {
        $(document).ready(function() {
            callback();
        });
    }
    ```

- success

    [Function] function to handle data when success

    Example:

    ```Javascript
    success = function(data) {
        console.log(data);
    }
    ```

- error

    [Function] function to handle error

    Example:

    ```Javascript
    error = function(e) {
        console.log(e);
    }
    ```

### Cache.timestamp()

```Javascript
var cache, microtime;
cache = new Cache({prefix: "myprefix_"});
microtime = cache.timestamp('cacheID');
```

## Examples (in Javascirpt)

### Basic Usage:

```Javascript
var cache, fetch, success;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success) {
    $.get('http://example.com/abc.json', success);
}
success = function(data) {
    // do sth with data;
}
cache.get({id: 'cacheID', fetch: fetch, success: success})
```

### Error Handle

```Javascript
var cache, fetch, success, error;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success, error) {
    $.ajax({
        url: 'http://example.com/abc.json',
        success: success,
        error: error
    });
}
success = function(data) {
    // do sth with data;
}
error = function(e) {
    console.error(e);
}
cache.get({id: 'cacheID', fetch: fetch, success: success, error: error})
```

### Data Parse

```Javascript
var cache, fetch, parse, success, error;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success, error) {
    $.ajax({
        url: 'http://example.com/api/data',
        success: success,
        error: error
    });
}
success = function(data) {
    // do sth with data;
}
error = function(e) {
    console.error(e);
}
parse = function(data) {
    return JSON.parse(data);
}
cache.get({id: 'cacheID', fetch: fetch, parse: parse, success: success, error: error})
```

### Data Validation

```Javascript
var cache, fetch, validate, success, error;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success, error) {
    $.ajax({
        url: 'http://example.com/api/data',
        success: success,
        error: error
    });
}
success = function(data) {
    // do sth with data;
}
error = function(e) {
    console.error(e);
}
validate = function(data) {
    if(data.length > 100) {
        return true;
    } else {
        return false;
    }
}
cache.get({id: 'cacheID', fetch: fetch, validate: validate, success: success, error: error})
```

### Update Control

#### Example 1

```Javascript
var cache, fetch, success;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success) {
    $.get('http://example.com/abc.json', success);
}
success = function(data) {
    // do sth with data;
}
cache.get({id: 'cacheID', fetch: fetch, update: false, success: success})
```
#### Example 2

```Javascript
var cache, fetch, update, success;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success) {
    $.get('http://example.com/abc.json', success);
}
success = function(data) {
    // do sth with data;
}
update = function() {
    if(some condition here) {
        return true;
    } else {
        return false;
    }
}
cache.get({id: 'cacheID', fetch: fetch, update: update, success: success})
```

### Update with Delay

```Javascript
var cache, fetch, updateAfter, success;
cache = new Cache({prefix: "myprefix_"})
fetch = function(success) {
    $.get('http://example.com/abc.json', success);
}
success = function(data) {
    // do sth with data;
}
updateAfter = function(callback) {
    $(document).ready(function() {
        callback();
    });
}
cache.get({id: 'cacheID', fetch: fetch, updateAfter: updateAfter, success: success})
```

### Get Cache Timestamp

```Javascript
var cache, microtime;
cache = new Cache({prefix: "myprefix_"});
microtime = cache.timestamp('cacheID');
```
### Turn On Debug

```Javascript
cache = new Cache({prefix: "myprefix_", debug: true});
// some code here
```
