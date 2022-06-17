import { isValidNotebookUrl, convertUrlToNbViewerUrl } from './utils'
import embedTemplate from './templates/embed-iframe'
import Mustache from 'mustache'

/**
 * the dialog that appears when the user clicks the "Embed Jupyter Notebook" toolbar button
 */
export function jupyterNotebookDialog() {
    return {
        title: 'Embed Jupyter Notebook',
        minWidth: 510,
        minHeight: 200,
        contents: [
            {
                id: 'jupyterNotebookPlugin',
                expand: true,
                elements: [
                    {
                        type: 'hbox',
                        widths: ['100%'],
                        children: [
                            {
                                id: 'notebookTitle',
                                type: 'text',
                                label: 'Jupyter Notebook Title',
                                default: 'Jupyter Notebook',
                            },
                        ],
                    },
                    {
                        type: 'hbox',
                        widths: ['100%'],
                        children: [
                            {
                                id: 'notebookUrl',
                                type: 'text',
                                label: 'Jupyter Notebook URL (.ipynb)',
                                placeholder:
                                    'https://docserver.gesdisc.eosdis.nasa.gov/public/project/notebooks/How_To_Access_MERRA2_Using_OPeNDAP_with_Python3_Calculate_Weekly_from_Hourly.ipynb',
                                validate: function () {
                                    if (
                                        this.getValue() &&
                                        isValidNotebookUrl(this.getValue())
                                    ) {
                                        return true
                                    }

                                    alert(
                                        'Please enter a valid URL to a Jupyter Notebook'
                                    )
                                    return false
                                },
                            },
                        ],
                    },
                ],
            },
        ],
        onOk: function () {
            // get a nbviewer url to the provided notebook
            const url = convertUrlToNbViewerUrl(
                this.getValueOf('jupyterNotebookPlugin', 'notebookUrl')
            )

            // create a new iframe embed, using the values the user has input
            const iframeEmbed = Mustache.render(embedTemplate, {
                title: this.getValueOf('jupyterNotebookPlugin', 'notebookTitle'),
                url,
            })

            // add iframe to the body at the users cursor location
            const element = CKEDITOR.dom.element.createFromHtml(
                `<div class="jupyter-notebook">${iframeEmbed}</div>`
            )

            this.getParentEditor().insertElement(element)
        },
    }
}
