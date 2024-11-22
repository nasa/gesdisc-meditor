import type { NextApiRequest, NextApiResponse } from 'next'
import putDocumentHandler from '../models/[modelName]/documents/'
import { apiError, ErrorCode, HttpException } from 'utils/errors'

// our new API supports uploading a document as JSON
// however the legacy API only supported file based uploads, which are difficult to use
// we'll need to parse the file upload here and pass the resulting JSON on to the new RESTful API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            throw new HttpException(
                ErrorCode.MethodNotAllowed,
                `Method ${req.method} Not Allowed`
            )
        }

        //! Step 1: Extract the boundary from the Content-Type header
        const contentType = req.headers['content-type']

        if (!contentType?.startsWith('multipart/form-data')) {
            throw new HttpException(ErrorCode.BadRequest, 'Invalid content type')
        }

        const boundary = contentType.split('boundary=')[1]

        if (!boundary) {
            throw new HttpException(ErrorCode.BadRequest, 'Boundary not found')
        }

        //! Step 2: Split the raw data into parts
        const parts = req.body.toString().split(`--${boundary}`)

        //! Step 3: Parse each part to find the file
        for (const part of parts) {
            if (
                part.includes('Content-Disposition: form-data;') &&
                part.includes('filename="')
            ) {
                // Extract the JSON content
                const jsonStart = part.indexOf('\r\n\r\n') + 4 // Find the start of the file content
                const jsonEnd = part.lastIndexOf('\r\n')
                const fileContent = part.slice(jsonStart, jsonEnd).trim()

                //! Step 4: retrieve the model name from the JSON content and add the file content as the new body
                const document = JSON.parse(fileContent)
                req.query.modelName = encodeURIComponent(document['x-meditor'].model)
                req.body = fileContent

                //! Step 5: call the new REST endpoint handler with the JSON content as the body
                req.body = fileContent
                return putDocumentHandler(req, res)
            }
        }

        // if we get here, no file was found in the body
        throw new HttpException(ErrorCode.BadRequest, 'No file found in form-data')
    } catch (err) {
        return apiError(err, res)
    }
}
