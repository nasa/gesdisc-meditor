/**
 * a valid Jupyter Notebook URL is:
 *     - valid URL starting with http or https
 *     - a URL pointing to a .ipynb file
 */
export function isValidNotebookUrl(testStr) {
    let url

    // check that URL is a valid URL first
    try {
        url = new URL(testStr)
    } catch (_) {
        return false
    }

    // check that we're pointing to a .ipynb file
    if (!url.href.endsWith('.ipynb')) {
        return false
    }

    // make sure this is a http url (not a local file)
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
        return false
    }

    return true
}

export function convertUrlToNbViewerUrl(url) {
    if (!isValidNotebookUrl(url)) {
        return url // not a notebook url so not convertable
    }

    return (
        process.env.NEXT_PUBLIC_NOTEBOOKVIEWER_URL +
        '?notebookUrl=' +
        encodeURIComponent(url)
    )
}
