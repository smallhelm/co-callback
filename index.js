var co = require("co");

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}
function isGeneratorFunction(obj) {
  if (!obj) return false;
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

module.exports = {
    run: function(gen_fn, callback){
        co(gen_fn).then(function(data){
            callback(void 0, data);
        }, function(err){
            callback(err);
        });
    },
    promiseRun: function(gen_fn){
        return co(gen_fn);
    },
    wrap: function(gen_fn){
        return co.wrap(gen_fn);
    },
    toYieldable: function(fn){
        return function(){
            var that = this;
            var args = [];
            var i;
            for(i=0; i < fn.length - 1; i++){
                args.push(i < arguments.length ? arguments[i] : void 0);
            }
            return new Promise(function(resolve, reject){
                var callback = function(err, data){
                    if(err) reject(err);
                    else resolve(data);
                };
                args.push(callback);
                fn.apply(that, args);
            });
        };
    },
    isGeneratorFunction: isGeneratorFunction
};
