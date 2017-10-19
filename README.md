# co-callback

[![build status](https://secure.travis-ci.org/smallhelm/co-callback.svg)](https://travis-ci.org/smallhelm/co-callback)

callback friendly [co](https://www.npmjs.com/package/co) for generator async control flow

## Example
```js
var fs = require("fs");
var cocb = require("co-callback");

var readFileYieldable = cocb.wrap(fs.readFile);

cocb.run(function*(){

    var file1 = yield readFileYieldable("./package.json", "utf8");
    var file2 = yield readFileYieldable("./index.js", "utf8");

    return file1 + file2;
}, function(err, txt){

    console.log(txt);

});
```
This simply outputs package.json concatenated with index.js

## API
### cocb.run(fn\*, callback)
Run the generator function, callback when finished.

### cocb.isGeneratorFunction(v)
return true if it is a generator function

### cocb.wrap(fn\_with\_callback) or cocb.wrap(fn\*)

Converts a callback function, or generator into one you can `yield`. (i.e. a `Promise` function - see [co.wrap](https://github.com/tj/co#var-fn--cowrapfn))

For example:

```sh
var foo = cocb.wrap(function(a, b, callback){
   // some callback async stuff...
});

var bar = cocb.wrap(function * (one, two){
   // some yield async stuff...
});

cocb.run(function*(){

    yield foo("a", "b")
    yield bar(1, 2)

}, callback);
```


## Promises are lies ;)

Promise hell is a real place, it's complicated, has hidden errors, and lies to you with a smile. Callbacks are simpler and naturally robust, but yes, it has a hell too.

As with any programming tool, you need learn, practice, and master. If you don't, you will waste a lot of time in hell.

[escape callback hell](http://callbackhell.com/)

[escape promise hell](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)

## License
MIT
