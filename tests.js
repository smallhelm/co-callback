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

    t.plan(3);

    var throwup = function(){
        throw "foobar"
    };
    cocb.run(function*(){
        throwup();
        t.fail();
    }, function(err){
        t.deepEquals(err, "foobar");
    });


    var throwupYieldable = cocb.toYieldable(function(callback){
        throw "baz";
    });
    cocb.run(function*(){
        yield throwupYieldable();
        t.fail();
    }, function(err){
        t.deepEquals(err, "baz");
    });


    var throwupCBYieldable = cocb.toYieldable(function(callback){
        callback("qux");
    });
    cocb.run(function*(){
        yield throwupCBYieldable();
        t.fail();
    }, function(err){
        t.deepEquals(err, "qux");
    });
});

test("toYieldable", function(t){

    var fnWith2Args = cocb.toYieldable(function(a, b, callback){
        callback(null, [a, b]);
    });

    var readFileYieldable = cocb.toYieldable(fs.readFile);

    cocb.run(function*(){

        t.deepEquals(yield fnWith2Args(1, 2), [1, 2]);
        t.deepEquals(yield fnWith2Args(1), [1, void 0], "callback works if less than required args are given");
        t.deepEquals(yield fnWith2Args(), [void 0, void 0], "callback works if no args are given");
        t.deepEquals(yield fnWith2Args(3, 2, 1), [3, 2], "extra args are ignored, and callback still works");

        var txt = yield readFileYieldable(path.resolve(__dirname, "package.json"));
        t.ok(txt.length > 0);

    }, t.end);
});

test("promiseRun", function(t){
    cocb.promiseRun(function*(){
        return yield delay(1, null, 3);
    })
        .catch(t.end)
        .then(function(val){
            t.equals(val, 3);

            var caught = false;
            cocb.promiseRun(function*(){
                return yield delay(1, "foo", 3);
            })
                .catch(function(err){
                    caught = true;
                    t.equals(err, "foo");
                })
                .then(function(){
                    t.ok(caught === true) ;
                    t.end();
                });
        });
});

test("isGeneratorFunction", function(t){
    t.equal(cocb.isGeneratorFunction(function*(){}), true);
    t.equal(cocb.isGeneratorFunction(function(){}), false);
    var f = function(){};
    f.next = function(){};
    f.throw = function(){};
    t.equal(cocb.isGeneratorFunction(f), false);
    t.equal(cocb.isGeneratorFunction(cocb.wrap(function*(){})), false);

    t.equal(cocb.isGeneratorFunction(void 0), false);
    t.equal(cocb.isGeneratorFunction(null), false);
    t.equal(cocb.isGeneratorFunction(false), false);
    t.equal(cocb.isGeneratorFunction(NaN), false);
    t.equal(cocb.isGeneratorFunction([]), false);
    t.equal(cocb.isGeneratorFunction({}), false);

    t.end();
});
