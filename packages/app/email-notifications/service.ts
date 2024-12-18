import he from 'he'
import log from '../lib/log'
import mustache from 'mustache'
import { getUsersDb } from '../auth/db'
import { User } from 'declarations'
import type { ModelWithWorkflow } from '../models/types'
import {
    getNodesFromEdges,
    getTargetEdges,
    getTargetUserRoles,
} from '../workflows/service'
import type { WorkflowEdge } from '../workflows/types'
import type { UserContactInformation } from '../auth/types'
import type { Document } from '../documents/types'
import type { EmailMessage, EmailMessageLink } from './types'

export async function constructEmailMessageForStateChange(
    model: ModelWithWorkflow,
    document: Document,
    newState: string,
    currentEdge: WorkflowEdge,
    user: User
): Promise<EmailMessage> {
    // if the workflow does not have it's own email message configured, we'll use this default message
    const DEFAULT_EMAIL_TEMPLATE =
        `An {{modelName}} document drafted by {{authorName}} has been marked by {{role}} {{userFirstName}} {{userLastName}} as '{{label}}' and is now in a '{{target}}' state.\n\n` +
        `An action is required to transition the document to one of the [{{targets}}] states. {{modelNotificationTemplate}}`

    let emailToUsers = await getUsersToNotifyOfStateChange(
        model,
        document['x-meditor'].state,
        currentEdge
    )
    let emailCcUsers = await getUsersToCc(
        document['x-meditor'].modifiedBy,
        user.uid,
        emailToUsers
    )

    if (!emailToUsers.length && !emailCcUsers.length) {
        // need at least one user to notify!
        throw new Error('Could not find users to notify of the state change')
    }

    const targetNodes = getNodesFromEdges(model.workflow.currentEdges)

    // populate a email message
    const emailMessage = await populateEmailMessageTemplate(
        model,
        document,
        targetNodes,
        currentEdge,
        document['x-meditor'].modifiedBy,
        user.uid,
        DEFAULT_EMAIL_TEMPLATE
    )

    // TODO: consider putting the version back on, was removed to avoid acting on old documents
    const emailLink: EmailMessageLink = {
        label: document[model.titleProperty],
        url: `${
            process.env.APP_URL || 'http://localhost'
        }/meditor/${serializeLinkUrlParamsForEmail([
            model.name,
            document[model.titleProperty],
        ])}`,
    }

    return {
        // emails to send to. (use "cc" users if no "to" users found)
        to: (!emailToUsers.length ? emailCcUsers : emailToUsers).map(user =>
            formatUserForEmail(user)
        ),

        // emails to "CC". (don't duplicate if using "cc" users in the "to" line already)
        cc: (!emailToUsers.length ? [] : emailCcUsers).map(user =>
            formatUserForEmail(user)
        ),

        subject: `${model.name} document is now ${newState}`,
        body: emailMessage,
        link: emailLink,
        createdOn: new Date().toISOString(),
    }
}

/**
 * determines if email notifications should be sent for a particular document state change in a workflow
 */
export function shouldNotifyUsersOfStateChange(
    documentState: string,
    currentEdge: WorkflowEdge
) {
    // if a state is in this list, no notifications will be sent
    //! really should use the "notify" checkbox of workflow edges for this
    const DISABLE_NOTIFICATIONS_FOR_STATES = ['Init']

    if (DISABLE_NOTIFICATIONS_FOR_STATES.includes(documentState)) {
        log.debug(
            'Skipping notifications, document is in an initial state: ',
            documentState
        )

        // we only notify when a document moves beyond the initial states
        return false
    }

    if (currentEdge && !currentEdge.notify) {
        // don't notify if current edge has the "notify" property set to false
        log.debug(
            'Skipping notifications, current edge is set to not notify: ',
            currentEdge
        )
        return false
    }

    return true
}

/**
 * returns a list of users to notify when a document enters the specified "documentState"
 *
 * we have to dynamically figure out which users to notify of a state change based on where the document
 * is in it's assigned workflow
 *
 * For example: a document in "Under Review" state can move into "Approved" or "Draft" states
 * only the "Reviewer" role can transition into those states (based on the workflow)
 * so we look for users that have the "Reviewer" role for a given model
 */
export async function getUsersToNotifyOfStateChange(
    model: ModelWithWorkflow,
    documentState: string,
    currentEdge: WorkflowEdge
) {
    if (!shouldNotifyUsersOfStateChange(documentState, currentEdge)) {
        // shouldn't notify, so return no users
        // TODO: architecturally, "getUsersToNotifyOfStateChange" should return users regardless of whether we're notifying or not
        return []
    }

    const usersDb = await getUsersDb()

    // get list of workflow edges the document can follow. For example. a document in "Under Review" state
    // can be "Approved" or "Rejected", so the target edges would be ["Approve", "Reject"]
    const targetEdges = getTargetEdges(model.workflow.edges, documentState)

    log.debug('Target edges ', targetEdges)
    log.debug('Current edge ', currentEdge)

    // get roles that can transition the document into the next state
    const targetRoles = await getTargetUserRoles(
        targetEdges,
        documentState,
        currentEdge
    )

    log.debug('Target roles ', targetRoles)

    // get users that have that role
    const usersWithMatchingRoles = await usersDb.getUserIdsWithModelRoles(
        model,
        targetRoles
    )

    log.debug(
        `There are ${usersWithMatchingRoles.length} users with matching roles: `,
        usersWithMatchingRoles
    )

    // get contact information for users
    const usersToNotify = await usersDb.getContactInformationForUsers(
        usersWithMatchingRoles
    )

    log.debug('Users with contact info', usersToNotify.length)

    return usersToNotify || []
}

/**
 * returns a list of users to CC on the email, typically the original author of the document
 * and the user who changed the document state (i.e. a reviewer who has reviewed and "Approved")
 *
 * if ignoreUsers array is included, will remove those users from the list of CCs
 */
export async function getUsersToCc(
    originalAuthorUid: string,
    loggedInUserUid: string,
    ignoreUsers: UserContactInformation[] = []
) {
    const usersDb = await getUsersDb()

    const ccs = [loggedInUserUid, originalAuthorUid]
        // remove any users in the ignore users array (or the users already in the TO: list)
        .filter(uid => !ignoreUsers.find(user => user.uid == uid))

    // fetch and return the users contact info
    return usersDb.getContactInformationForUsers(ccs)
}

/**
 * returns an email formatted user (ex. '"John Snow" <johnsnow@mock.nasa.gov>')
 */
export function formatUserForEmail(user: {
    emailAddress?: string
    firstName?: string
    lastName?: string
}) {
    return user.emailAddress
        ? `"${user.firstName || ''} ${user.lastName || ''}" <${user.emailAddress}>`
        : ''
}

/**
 * this function takes either the default email template OR a custom email template that can be configured in the workflow and constructs
 * an email message out of it.
 */
export async function populateEmailMessageTemplate(
    model: ModelWithWorkflow,
    document: Document,
    targetNodes: string[],
    currentEdge: WorkflowEdge,
    authorUid: string,
    userUid: string,
    defaultEmailTemplate: string
) {
    const usersDb = await getUsersDb()
    const [userContactInformation] = await usersDb.getContactInformationForUsers([
        userUid,
    ])
    const [author] = await usersDb.getContactInformationForUsers([authorUid])

    // the model can define a notification template to display after the normal email message
    // we'll pull that in here and render it ahead of time
    const modelNotificationTemplate = mustache.render(
        model.notificationTemplate || '',
        document
    )

    // check the workflow node for a custom email message (overrides the ENTIRE email template)
    const { emailMessage: customEmailTemplate } = model.workflow.nodes.find(
        node => node.id === currentEdge.target
    )
    const emailTemplate = customEmailTemplate || defaultEmailTemplate

    // render the template with a few commonly used variables user's may find helpful to see in an email
    return he.decode(
        mustache.render(emailTemplate, {
            modelName: model.name,
            authorName: author ? `${author.firstName} ${author.lastName}` : '',
            author: authorUid,
            role: currentEdge.role,
            label: currentEdge.label,
            userFirstName:
                userContactInformation.firstName ?? userContactInformation.name,
            userLastName: userContactInformation.lastName ?? '',
            targets: targetNodes.join(', '),
            target: currentEdge.target,
            modelNotificationTemplate,
        })
    )
}

/**
 * emails end up being rendered in a way that breaks URL params when the user clicks links inside the email
 * this attempts to normalize url params by first replacing /'s and then encoding
 */
function serializeLinkUrlParamsForEmail(params: any[]) {
    return params
        .map(param => param.replace(/\//g, '%252F')) // replace /'s in URL (will be double encoded and break links if not encoded ahead of time)
        .map(param => encodeURIComponent(param))
        .join('/')
}
