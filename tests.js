var fs = require("fs");
var cocb = require("./");
var path = require("path");
var test = require("tape");

var delay = cocb.toYieldable(function(time, err, data, callback){
    setTimeout(function(){
        callback(err, data);
    }, time);
});


test("run", function(t){
    cocb.run(function*(){
        return yield delay(1, null, 3);
    }, function(err, val){
        if(err) return t.end(err);

        t.equals(val, 3);

        cocb.run(function*(){
            return yield delay(1, "foo", 3);
        }, function(err, val){
            t.equals(err, "foo");
            t.end();
        });
    });
});

test("order", function(t){
    var events = [];

    var delayE = cocb.toYieldable(function(id, time, err, data, callback){
        events.push("start:" + id);
        setTimeout(function(){
            if(err) return callback(err);
            events.push("done:" + id);
            callback(null, data);
        }, time);
    });

    cocb.run(function*(){
        (yield delayE("a", 10, null, true )) || (yield delayE("b", 1, null, true));
        (yield delayE("c", 10, null, false)) || (yield delayE("d", 1, null, true));
        yield delayE(yield delayE("foo", 10, null, "bar"), 10, null, "");
        yield delayE("baz", 10, "qux", "quux");
        t.fail();
    }, function(err){
        t.deepEquals(err, "qux");
        t.deepEquals(events, [
            "start:a",
            "done:a",
            "start:c",
            "done:c",
            "start:d",
            "done:d",
            "start:foo",
            "done:foo",
            "start:bar",
            "done:bar",
            "start:baz",
        ]);
        t.end();
    });
});

test("throw", function(t){
    var throwup = function(){
        throw "foobar"
    };
    cocb.run(function*(){
        throwup();
        t.fail();
    }, function(err){
        t.deepEquals(err, "foobar");
        t.end();
    });
});

test("toYieldable", function(t){
    var readFileYieldable = cocb.toYieldable(fs.readFile);
    cocb.run(function*(){
        return yield readFileYieldable(path.resolve(__dirname, "package.json"));
    }, function(err, data){
        if(err) return t.end(err);
        t.ok(data.length > 0);
        t.end();
    });
});