var fs = require("fs");
var cocb = require("./");

var readFileYieldable = cocb.toYieldable(fs.readFile);

cocb.run(function*(){

    var file1 = yield readFileYieldable("./package.json", "utf8");
    var file2 = yield readFileYieldable("./index.js", "utf8");

    return file1 + file2;
}, function(err, txt){

    console.log(txt);

});
