import { z } from 'zod'

const collaborationInputSchema = z.object({
    firstName: z.string().min(1),
    hasBeenActive: z.boolean(),
    initials: z.string().length(2),
    isActive: z.boolean(),
    lastName: z.string().min(1),
    privileges: z.array(z.string()),
    uid: z.string().min(2),
})

export { collaborationInputSchema }
