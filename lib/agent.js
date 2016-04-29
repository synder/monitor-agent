/**
 * Created by synder on 16/4/21.
 */

var configure = require('./configure');
var Reporter = require('./Reporter');
var MESSAGE = configure.MESSAGE;

var reporter = new Reporter({
    host : process.argv[2],
    port : process.argv[3],
    appName : process.argv[4],
    appKey : process.argv[5]
});

var masterProcessId = process.argv[6];
var quitForCrash = true;

var handleError = function (err) {
    if(err){
        console.error(err.stack);
    }
};

process.on('SIGINT', function() {

    quitForCrash = false;

    var requestUrl = configure.url(MESSAGE.APP_NODE_EVENT_STOP);

    reporter.report(requestUrl.method, requestUrl.url, false, {
        time : Date.now()
    }, function(){
        process.exit(0);
    });
});

process.on('disconnect', function(){
    if(!quitForCrash){

        var requestUrl = configure.url(MESSAGE.APP_NODE_EVENT_CRASH);

        reporter.report(requestUrl.method, requestUrl.url, false, {
            time : Date.now(),
            pid : masterProcessId,
            master: true
        }, function(err){
            process.exit(0);
        });
    }
});

process.on('message', function(message) {

    var requestUrl = configure.url(message.type);

    var cache = message.type > 6;

    reporter.report(requestUrl.method, requestUrl.url, cache, message.data, handleError);
});

setInterval(function(){
    process.send({type: MESSAGE.APP_NODE_PROCESS_INFO});
}, 1000);

