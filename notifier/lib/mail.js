import log from 'log'
import nodemailer from 'nodemailer'
var AWS = require('aws-sdk');

const HOST_NAME = process.env.HOST_NAME || 'disc.gsfc.nasa.gov'
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'mEditor'
const MAIL_FROM_USERNAME = process.env.MAIL_FROM_USERNAME || 'info'
const ON_MCP = process.env.ON_MCP || 'false'

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
    if (ON_MCP == 'true') {
        console.log("ON_MCP: " + ON_MCP);
        console.log("THIS IS ON MCP");
        return new Promise((resolve, reject) => {
            var params = {
                Destination: { 
                    CcAddresses: [
                            cc
                    ],
                    ToAddresses: [
                            to
                    ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: html
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Test email"
                }
                },
                Source: `${MAIL_FROM_USERNAME}@${HOST_NAME}`, /* required */
                ReplyToAddresses: [
                        `${MAIL_FROM_USERNAME}@${HOST_NAME}`
                ],
            };
            log.debug('Attempting to send message ', params)
            try {
                // Create the promise and SES service object
                var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params, (err, response) => {
                    if (err) {
                        throw(err)
                    }
                    else {
                        resolve(response);
                    }
                })
            } 
            catch (e) {
                reject(e)
            }

        })
    }
    else {
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
}
