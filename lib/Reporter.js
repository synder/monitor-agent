/**
 * Created by synder on 16/4/21.
 */
var os = require('os');
var http = require('http');
var crypto = require('crypto');
var hostname = os.hostname();

var Reportor = function(config){
    this.host = config.host;
    this.port = config.port;
    this.appKey = config.appKey;
    this.appSecret  = config.appSecret;
    this.caches = {};
    this.__init();
};

Reportor.prototype.__init = function(){

    if(!this.appKey){
        throw new Error('appKey should not be null or undefined');
    }

    if(!this.appSecret){
        throw new Error('appSecret should not be null or undefined');
    }
};

Reportor.prototype.__request = function(method, path, data, callback){
    
    var self = this,
        body = {
            key: self.appKey,
            node: hostname,
            data: data
        },
        temp = JSON.stringify(body),
        request = http.request({
            hostname : self.host,
            port : self.port,
            method : method,
            path : path,
            keepAlive:true,
            keepAliveMsecs: 1200000,
            headers : {
                'Content-Type': 'application/json',
                'Content-Length': temp.length
            }
        }, function(res){
            callback && callback(null, res);
        });

    request.on('error', function(err){
        callback && callback(err);
    });

    request.write(temp);
    request.end();
};

Reportor.prototype.report = function(method, path, cache, data, callback){

    var self = this,
        now = Date.now(),
        key = method + ':' + path;

    if(!self.caches[key]){
        self.caches[key] = {
            data : [],
            last : 0
        };
    }

    self.caches[key].data.push(data);

    if(!cache){
        self.__request(method, path, self.caches[key].data, callback);
        self.caches[key].data = [];
        self.caches[key].last = now;
    }else{
        if(self.caches[key].data.length > 19 || (now - self.caches[key].last) > 60000){
            self.__request(method, path, self.caches[key].data, callback);
            self.caches[key].data = [];
            self.caches[key].last = now;
        }
    }

};

module.exports = Reportor;