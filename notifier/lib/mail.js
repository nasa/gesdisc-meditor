import log from 'log'
import nodemailer from 'nodemailer'

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
	    var params = {
  	Destination: { /* required */
    CcAddresses: [
      /* more CC email addresses */
            'amberjungminlee@gmail.com',
    ],
    ToAddresses: [
      /* more To email addresses */
            'amberjungminlee@gmail.com',
    ]
  },
  Message: {
   Body: {
    Html: {
     Charset: "UTF-8",
     Data: "This message body contains HTML formatting. It can, for example, contain links like this one: <a class=\"ulink\" href=\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide\" target=\"_blank\">Amazon SES Developer Guide</a>."
    },
    Text: {
     Charset: "UTF-8",
     Data: "This is the message body in text format."
    }
   },
   Subject: {
    Charset: "UTF-8",
    Data: "Test email"
   }
  },
  Source: 'amberjungminlee@gmail.com', /* required */
  ReplyToAddresses: [
          'amberjungminlee@gmail.com'
  ],
};
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
