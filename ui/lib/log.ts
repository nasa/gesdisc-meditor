import log4js from 'log4js'

const log = log4js.getLogger('meditor-app')

const TEN_MEGABYTES = 10 * 1024 * 1024

// define where log messages go
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: {
            type: 'file',
            filename: 'logs/app.log',
            maxLogSize: TEN_MEGABYTES,
            backups: 3,
            compress: true,
        },
    },
    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' },
    },
})

log.level = process?.env?.NODE_ENV == 'development' ? 'debug' : 'info'

// override log level if LOG_LEVEL set
if (process?.env?.LOG_LEVEL) {
    log.level = process.env.LOG_LEVEL
}

export default log
