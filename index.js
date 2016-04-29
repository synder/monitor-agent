
/**
 * Created by synder on 16/4/20.
 * @desc a monitor agent
 */

var path = require('path');
var cluster = require('cluster');
var wraper = require('./lib/wraper');
var Daemon = require('./lib/Daemon');
var configure = require('./lib/configure');
var information = require('./lib/information');

var MESSAGE = configure.MESSAGE;

var dir = __dirname;

/**
 * @desc start monitor
 * */
exports.start = function(config){

    if(cluster.isMaster){

        var startWithCluster = false;
        var masterProcessId = process.pid;
        var childModulePath = path.join(dir, './lib/agent.js');
        var daemon = new Daemon();
        
        daemon.start(childModulePath, [
            masterProcessId,
            config.host,
            config.port,
            config.appName,
            config.appKey,
            config.appSecret
        ]);
        
        wraper.wrap(function(info){
            if(!startWithCluster){
                daemon.message(childModulePath, {
                    type : MESSAGE.APP_NODE_WEB_TRANS_INFO,
                    data : info
                });
            }
        });
        
        cluster.on('fork', function(work){
            work.on('exit', function(code){
                if(code !== 0){
                    daemon.message(childModulePath, {
                        type : MESSAGE.APP_NODE_EVENT_CRASH,
                        data : {
                            pid : work.process.pid,
                            time: Date.now(),
                            master : false
                        }
                    });
                }
            });
        });

        cluster.on('online', function(){

            var workProcessIds = [];

            startWithCluster = true;

            for(var key in cluster.workers){
                workProcessIds.push(cluster.workers[key].process.pid);
            }

            daemon.message(childModulePath, {
                type : MESSAGE.APP_NODE_INFO,
                data : {
                    dir : information.system.app.info().dir,
                    mpid: masterProcessId,
                    wpid: workProcessIds,
                    cluster : startWithCluster,
                    worker : workProcessIds.length
                }
            });
        });

        cluster.on('message', function(message){
            if(startWithCluster){
                message.data.ppid = masterProcessId;
                daemon.message(childModulePath, message);
            }
        });

        daemon.message(childModulePath, {
            type : MESSAGE.APP_NODE_EVENT_START,
            data:{
                time : Date.now()
            }
        });

        daemon.message(childModulePath, {
            type : MESSAGE.APP_NODE_SYS_INFO,
            data : information.system.info()
        });

        daemon.message(childModulePath, {
            type : MESSAGE.APP_NODE_INFO,
            data : {
                dir : information.system.app.info().dir,
                mpid: masterProcessId,
                wpid: null,
                cluster : startWithCluster,
                worker : 0
            }
        });

        daemon.receive(childModulePath, function(message){

            var processInfo = information.system.app.process.info();

            if(startWithCluster){

                for(var key in cluster.workers){
                    cluster.workers[key].process.send(message);
                }

                processInfo.ppid = processInfo.pid;
                daemon.message(childModulePath, {
                    type: message.type,
                    data: processInfo
                });

            }else{

                if(message.type === MESSAGE.APP_NODE_PROCESS_INFO){
                    processInfo.ppid = processInfo.pid;
                    daemon.message(childModulePath, {
                        type: message.type,
                        data: processInfo
                    });
                }

            }
        });
    }

    if(cluster.isWorker){

        wraper.wrap(function(info){
            process.send({
                type : MESSAGE.APP_NODE_WEB_TRANS_INFO,
                data : info
            });
        });

        process.on('message', function(message){
            if(message.type === MESSAGE.APP_NODE_PROCESS_INFO){
                process.send({
                    type : message.type,
                    data :  information.system.app.process.info()
                });
            }
        });
    }
};
