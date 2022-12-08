const NBVIEWER_PREFIX_DEFAULT = 'https://nbviewer.org/urls/'

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

/**
 * https://nbviewer.org/ is a Jupyter provided tool for rendering a notebook given a url
 *
 * this function converts a normal URL to a .ipynb file into a nbviewer url, for example:
 *
 * https://docserver.gesdisc.eosdis.nasa.gov/public/project/notebooks/How_To_Access_MERRA2_Using_OPeNDAP_with_Python3_Calculate_Weekly_from_Hourly.ipynb
 *
 * converts to
 *
 * https://nbviewer.org/urls/docserver.gesdisc.eosdis.nasa.gov/public/project/notebooks/How_To_Access_MERRA2_Using_OPeNDAP_with_Python3_Calculate_Weekly_from_Hourly.ipynb
 */
export function convertUrlToNbViewerUrl(url) {
    if (!isValidNotebookUrl(url)) {
        return url // not a notebook url so not convertable
    }

    // fallback to using the default prefix
    return url.replace('https://', NBVIEWER_PREFIX_DEFAULT)
}
