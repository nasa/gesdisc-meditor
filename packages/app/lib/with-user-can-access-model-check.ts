import assert from 'assert'
import createError from 'http-errors'
import { getServerSession } from 'auth/user'
import { NextApiRequest, NextApiResponse } from 'next'
import { User } from 'declarations'

const MODELS_REQUIRING_AUTHENTICATION = ['Users']

/**
 * this is an odd check...essentially this is mEditor's original design and the access check:
 *
 *      1. if the user is logged in, they can access any model
 *      2. if the user is not logged in, we only restrict them from the models in the MODELS_REQUIRING_AUTHENTICATION array
 */
export function withUserCanAccessModelCheck(
    handler: (req: NextApiRequest, res: NextApiResponse) => void
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const modelName = decodeURIComponent(req.query.modelName.toString()) // this intentionally should fail if used on an endpoint that doesn't include a modelName (developer issue not a user issue)
        const session = await getServerSession(req, res)

        assert(
            await userCanAccessModel(session?.user, modelName),
            new createError.Forbidden(
                'User does not have access to the requested model'
            )
        )

        // Call the original handler
        await handler(req, res)
    }
}

export async function userCanAccessModel(user: User | undefined, modelName: string) {
    return user?.uid ? true : !MODELS_REQUIRING_AUTHENTICATION.includes(modelName)
}
