import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { MdCheck, MdClose, MdComment, MdEdit, MdReply, MdSend } from 'react-icons/md'
import IconButton from '../icon-button'
import styles from './document-comments.module.css'

const AVATAR_URL =
    'https://bugs.earthdata.nasa.gov/secure/useravatar?size=large&ownerId=${uid}'
const DEFAULT_PARENT_ID = 'root'
const DEFAULT_COMMENT = {
    text: '',
    resolved: false,
    parentId: DEFAULT_PARENT_ID,
}

const CommentCard = ({
    comment,
    onSave,
    user = null,
    onCancel = () => {},
    onResolve = _comment => {},
}) => {
    const [newComment, setNewComment] = useState('')
    const [editing, setEditing] = useState(false)
    const [replyComment, setReplyComment] = useState(null)
    const [validated, setValidated] = useState(false)

    const showCardActions = '_id' in comment && !comment.resolved && !editing
    const showChildComments =
        replyComment || (comment.children && comment.children.length)

    useEffect(() => {
        if (!comment._id) {
            setEditing(true)
        }
    }, [comment])

    useEffect(() => {
        setNewComment(comment.text)
    }, [editing])

    const handleSubmit = event => {
        const form = event.currentTarget

        event.preventDefault()
        event.stopPropagation()

        let isValid = form.checkValidity()

        setValidated(true)

        if (!isValid) return

        if (comment) {
            // update the existing comment
            onSave(Object.assign(comment, { text: newComment }))
            setEditing(false)
        } else {
            // create a new comment
            onSave(newComment)
        }
    }

    const handleCancel = () => {
        setEditing(false)
        onCancel()
    }

    const handleReplyTo = () => {
        if (replyComment) return

        let newComment = Object.assign({}, DEFAULT_COMMENT)
        newComment.parentId = comment._id
        setReplyComment(newComment)
    }

    const handleSubmitReply = reply => {
        onSave(reply)
        setReplyComment(null)
    }

    return (
        <Card
            className={`${styles.card} ${comment.resolved ? styles.resolved : ''} ${
                comment.parentId == DEFAULT_PARENT_ID ? styles.rootCard : ''
            }`}
        >
            <Card.Body>
                {comment._id && (
                    <div className={styles.title}>
                        <div>
                            <Image
                                src={AVATAR_URL.replace(
                                    '${uid}',
                                    comment.userUid || 'undefined'
                                )}
                                roundedCircle
                            />
                        </div>

                        <div>
                            <h5>{comment.createdBy}</h5>
                            <small>
                                {format(
                                    new Date(comment.createdOn),
                                    'M/d/yy, h:mm aaa'
                                )}
                            </small>
                        </div>
                    </div>
                )}

                {editing ? (
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group>
                            <textarea
                                className="form-control"
                                required
                                rows={3}
                                placeholder="Leave your comment here..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />

                            <Form.Control.Feedback type="invalid">
                                Please enter a comment.
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className={styles.cardActions}>
                            <IconButton alt="Save" type="submit">
                                <MdSend />
                            </IconButton>

                            <IconButton alt="Cancel" onClick={handleCancel}>
                                <MdClose />
                            </IconButton>
                        </div>
                    </Form>
                ) : (
                    <div className={styles.body}>{comment.text}</div>
                )}

                {showCardActions && (
                    <div className={styles.cardActions}>
                        <IconButton alt="Reply to comment" onClick={handleReplyTo}>
                            <MdReply />
                        </IconButton>

                        {user.uid == comment.userUid && (
                            <IconButton
                                alt="Edit comment"
                                onClick={() => setEditing(true)}
                            >
                                <MdEdit />
                            </IconButton>
                        )}

                        {comment.parentId == DEFAULT_PARENT_ID && (
                            <IconButton
                                alt="Resolve comment"
                                onClick={() => onResolve(comment)}
                            >
                                <MdCheck />
                            </IconButton>
                        )}
                    </div>
                )}
            </Card.Body>

            {!!showChildComments && (
                <div className={styles.childComments}>
                    {replyComment && (
                        <CommentCard
                            key={`${replyComment.parentId}-reply`}
                            comment={replyComment}
                            onSave={handleSubmitReply}
                            onCancel={() => setReplyComment(null)}
                        />
                    )}

                    {comment.children.map(childComment => (
                        <CommentCard
                            key={childComment._id}
                            user={user}
                            comment={childComment}
                            onSave={onSave}
                        />
                    ))}
                </div>
            )}
        </Card>
    )
}

const DocumentComments = ({ user, comments = [], saveComment, resolveComment }) => {
    const [newComment, setNewComment] = useState(null)
    const [showAll, setShowAll] = useState(false)

    const handleCreateComment = () => {
        setNewComment(Object.assign({}, DEFAULT_COMMENT))
    }

    const updateComment = comment => {
        saveComment(comment).then(() => setNewComment(null))
    }

    // hide resolved comments unless show all is clicked
    const filterCommentByResolved = comment => {
        return showAll || !comment.resolved
    }

    return (
        <div>
            <div className={styles.buttons}>
                {!newComment && (
                    <Button
                        className={styles.button}
                        variant="outline-dark"
                        onClick={handleCreateComment}
                    >
                        <MdComment />
                        New Comment
                    </Button>
                )}

                <Button
                    className={styles.button}
                    variant="outline-dark"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? (
                        <>
                            <IoMdEyeOff />
                            Hide Resolved
                        </>
                    ) : (
                        <>
                            <IoMdEye />
                            Show All
                        </>
                    )}
                </Button>
            </div>

            {newComment && (
                <CommentCard
                    key="new"
                    comment={newComment}
                    onSave={updateComment}
                    onCancel={() => setNewComment(null)}
                />
            )}

            {comments === null ? (
                <p className="text-center py-4 text-danger">
                    mEditor had an error getting comments for this document. Please
                    try refreshing the page once your work is saved. mEditor has
                    recorded the error, but you can still leave feedback using the
                    link at the top of the page.
                </p>
            ) : (
                <>
                    {!comments.length && (
                        <div className="text-center py-4 text-muted">
                            There are no comments yet.
                        </div>
                    )}

                    {comments.filter(filterCommentByResolved).map(comment => (
                        <CommentCard
                            key={comment._id}
                            user={user}
                            comment={comment}
                            onSave={updateComment}
                            onResolve={resolveComment}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

export default DocumentComments
