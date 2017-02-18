var co = require("co");

module.exports = {
    run: function(gen_fn, callback){
        co(gen_fn).then(function(data){
            callback(void 0, data);
        }, function(err){
            callback(err);
        });
    },
    wrap: co.wrap,
    toYieldable: function(fn){
        return function(){
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            return new Promise(function(resolve, reject){
                var callback = function(err, data){
                    if(err) reject(err);
                    else resolve(data);
                };
                fn.apply(that, args.concat([callback]));
            });
        };
    }
};
