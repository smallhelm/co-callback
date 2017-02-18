# co-callback

[![build status](https://secure.travis-ci.org/smallhelm/co-callback.svg)](https://travis-ci.org/smallhelm/co-callback)

callback friendly [co](https://www.npmjs.com/package/co) generator async control flow goodness

## Example
```js
var fs = require("fs");
var cocb = require("co-callback");

var readFileYieldable = cocb.toYieldable(fs.readFile);

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

### cocb.wrap(fn\*)
Same as [co.wrap](https://github.com/tj/co#var-fn--cowrapfn)

### cocb.toYieldable(fn)
Converts a traditional callback function into one you can `yield` instead of using a callback as the final argument.

## Promises are lies ;)

Promise hell is a real place, it's complicated, has hidden errors, and lies to you with a smile. Callbacks are simpler and naturally robust, but yes, it has a hell too.

As with any programming tool, you need learn, practice, and master. If you don't, you will waste a lot of time in hell.

[escape callback hell](http://callbackhell.com/)

[escape promise hell](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)

## License
MIT
