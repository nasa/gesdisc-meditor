import { getLoggedInUser } from 'auth/user'
import {
    getDocumentCollaborators,
    setDocumentCollaborator,
} from 'collaboration/service'
import type { NextApiRequest, NextApiResponse } from 'next'
import { respondAsJson } from 'utils/api'
import { apiError, ErrorCode, HttpException } from 'utils/errors'
import { safeParseJSON } from 'utils/json'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const modelName = decodeURIComponent(req.query.modelName.toString())
    const documentTitle = decodeURIComponent(req.query.documentTitle.toString())
    const user = await getLoggedInUser(req, res)

    switch (req.method) {
        case 'GET': {
            // Unlike most GET endpoints, unauthenticated users should not have access to an authenicated user's actions.
            if (!user) {
                return apiError(
                    new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
                    res
                )
            }

            const [error, collaborators] = await getDocumentCollaborators(
                documentTitle,
                modelName
            )

            if (error) {
                return apiError(error, res)
            }

            return respondAsJson(collaborators, req, res)
        }

        case 'POST': {
            if (!user) {
                return apiError(
                    new HttpException(ErrorCode.Unauthorized, 'Unauthorized'),
                    res
                )
            }

            const [parseError, collaborator] = safeParseJSON(req.body)

            if (parseError) {
                return apiError(
                    new HttpException(
                        ErrorCode.BadRequest,
                        'The request body could not be parsed.'
                    ),
                    res
                )
            }

            const [error, collaborators] = await setDocumentCollaborator(
                collaborator,
                documentTitle,
                modelName
            )

            if (error) {
                return apiError(error, res)
            }

            return respondAsJson(collaborators, req, res, { httpStatusCode: 201 })
        }

        default:
            return res.status(405).end()
    }
}
