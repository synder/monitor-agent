/**
 * Created by synder on 16/4/21.
 */

var os = require('os');

var hostname = os.hostname();

exports.hostname = hostname;

exports.system = {
    info: function () {
        return {
            type: os.type(),
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            cpus: os.cpus().length,
            totalmem: os.totalmem(),
            node: process.versions.node,
            v8: process.versions.v8,
            uv: process.versions.uv,
            zlib: process.versions.zlib,
            ares: process.versions.ares,
            icu: process.versions.icu,
            modules: process.versions.modules,
            openssl: process.versions.openssl
        };
    },
    app: {
        info: function () {
            return {
                dir: process.cwd()
            };
        },
        process: {
            info: function () {

                var memoryUsage = process.memoryUsage();

                return {
                    ppid: null,
                    pid: process.pid,
                    time: Date.now(),
                    loadavg: os.loadavg()[0],
                    memory: {
                        rss: memoryUsage.rss,
                        heap: memoryUsage.heapTotal,
                        used: memoryUsage.heapUsed,
                        free: os.freemem()
                    }
                }
            }
        }
    }
};
