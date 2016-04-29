/**
 * Created by synder on 16/4/21.
 */

var os = require('os');
var http = require('http');
var https = require('https');


var wrapCreateServer = function(type, func, callback){

    type.createServer = function(){

        var server = func.apply(type, arguments);

        server.on('request', function(req, res){

            var inMem = process.memoryUsage(),
                info = {
                    method: req.method,
                    url: req.url,
                    status : {
                        code : null,
                        msg :  null
                    },
                    time: {
                        in : Date.now(),
                        out : null
                    },
                    rss: {
                        in: inMem.rss,
                        out: null
                    },
                    heap: {
                        in: inMem.heapTotal,
                        out: null
                    },
                    used: {
                        in: inMem.heapUsed,
                        out: null
                    },
                    free : {
                        in: os.freemem(),
                        out: null
                    },
                    loadavg : null
                },
                end = res.end;

            res.end = function(){
                var index = arguments.length - 1;
                var last = arguments[index];
                var isFunc = typeof last === 'function';

                if(isFunc || !last){
                    arguments[index] = function(){
                        if(res.statusCode !== 404){

                            var outMem = process.memoryUsage(),
                                freemem = os.freemem();

                            info.status.code = res.statusCode;
                            info.status.msg = res.statusMessage;

                            info.time.out = Date.now();
                            info.rss.out = outMem.rss;
                            info.heap.out = outMem.heapTotal;
                            info.used.out = outMem.heapUsed;
                            info.free.out = freemem;
                            info.loadavg = os.loadavg()[0];

                            if(isFunc){
                                last();
                            }

                            callback(info);
                        }
                    };
                } else {

                    arguments[arguments.length] = function(){

                        if(res.statusCode !== 404){

                            var outMem = process.memoryUsage(),
                                freemem = os.freemem();

                            info.status.code = res.statusCode;
                            info.status.msg = res.statusMessage;

                            info.time.out = Date.now();
                            info.rss.out = outMem.rss;
                            info.heap.out = outMem.heapTotal;
                            info.used.out = outMem.heapUsed;
                            info.free.out = freemem;
                            info.loadavg = os.loadavg()[0];

                            callback(info);
                        }
                    };
                    arguments.length += 1;
                }

                return end.apply(res, arguments);
            };
        });

        return server;
    };
};

exports.wrap = function(callback){
    wrapCreateServer(http, http.createServer, callback);
    wrapCreateServer(https, https.createServer, callback);
};
