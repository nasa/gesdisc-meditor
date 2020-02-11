import log from 'log'
import nodemailer from 'nodemailer'

const HOST_NAME = process.env.HOST_NAME || 'disc.gsfc.nasa.gov'
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'mEditor'
const MAIL_FROM_USERNAME = process.env.MAIL_FROM_USERNAME || 'info'

log.debug('Sending mail from host name: %s', HOST_NAME)
log.debug('Using mail host: %s', process.env.MAIL_HOST)

const transporter = nodemailer.createTransport({
    newline: 'unix',
    host: process.env.MAIL_HOST,
    port: 25,
    tls: {
        rejectUnauthorized: false,
    },
})

export function sendMail(subject, text, html, to, cc = '') {
    return new Promise((resolve, reject) => {
        const from = `${MAIL_FROM_NAME} <${MAIL_FROM_USERNAME}@${HOST_NAME}>`
        const message = { from, subject, text, html, to, cc, }

        log.debug('Attempting to send message ', message)

        try {
            transporter.sendMail(message, (err, response) => {
                if (err) {
                    throw(err)
                } else {
                    resolve(response)
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}
