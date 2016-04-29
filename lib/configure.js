/**
 * Created by synder on 16/4/23.
 */

/**
 *  process message type
 * */
var MESSAGE = {
    APP_NODE_EVENT_START : 1,
    APP_NODE_EVENT_STOP : 2,
    APP_NODE_EVENT_ERROR : 3,
    APP_NODE_EVENT_CRASH : 4,

    APP_NODE_INFO : 5,
    APP_NODE_SYS_INFO : 6,

    APP_NODE_PROCESS_INFO : 7,
    APP_NODE_WEB_TRANS_INFO : 8
};

var REPORT_URLS = {};

REPORT_URLS[MESSAGE.APP_NODE_EVENT_START] = {
    method : 'PUT',
    url : '/app/node/event/start'
};

REPORT_URLS[MESSAGE.APP_NODE_EVENT_STOP] = {
    method : 'PUT',
    url : '/app/node/event/stop'
};

REPORT_URLS[MESSAGE.APP_NODE_EVENT_ERROR] = {
    method : 'PUT',
    url : '/app/node/event/error'
};

REPORT_URLS[MESSAGE.APP_NODE_EVENT_CRASH] = {
    method : 'PUT',
    url : '/app/node/event/crash'
};

REPORT_URLS[MESSAGE.APP_NODE_INFO] = {
    method : 'PUT',
    url : '/app/node/info'
};

REPORT_URLS[MESSAGE.APP_NODE_SYS_INFO] = {
    method : 'PUT',
    url : '/app/node/system/info'
};

REPORT_URLS[MESSAGE.APP_NODE_PROCESS_INFO] = {
    method : 'PUT',
    url : '/app/node/process/info'
};

REPORT_URLS[MESSAGE.APP_NODE_WEB_TRANS_INFO] =  {
    method : 'PUT',
    url : '/app/node/web/tran/info'
};


exports.url = function (msg) {
    return REPORT_URLS[msg];
};

exports.MESSAGE = MESSAGE;