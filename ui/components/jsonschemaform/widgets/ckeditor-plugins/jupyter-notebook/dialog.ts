import { isValidNotebookUrl, convertUrlToNbViewerUrl } from './utils'

/**
 * the dialog that appears when the user clicks the "Embed Jupyter Notebook" toolbar button
 */
export function jupyterNotebookDialog(instance) {
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
                        widths: ['70%', '15%', '15%'],
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
                            {
                                type: 'text',
                                id: 'notebookWidth',
                                width: '60px',
                                label: 'Width',
                                default: '640',
                                validate: function () {
                                    if (
                                        this.getValue() &&
                                        parseInt(this.getValue()) > 0
                                    ) {
                                        return true
                                    }

                                    alert('Please enter a valid width')
                                    return false
                                },
                            },
                            {
                                type: 'text',
                                id: 'notebookHeight',
                                width: '60px',
                                label: 'Height',
                                default: '500',
                                validate: function () {
                                    if (
                                        this.getValue() &&
                                        parseInt(this.getValue()) > 0
                                    ) {
                                        return true
                                    }

                                    alert('Please enter a valid height')
                                    return false
                                },
                            },
                        ],
                    },
                    {
                        type: 'hbox',
                        widths: ['55%', '45%'],
                        children: [
                            {
                                id: 'isResponsive',
                                type: 'checkbox',
                                label: 'Make Responsive (ignore width and height, fit to width)',
                                default: false,
                            },
                        ],
                    },
                ],
            },
        ],
        onOk: function () {
            const width = this.getValueOf('jupyterNotebookPlugin', 'notebookWidth')
            const height = this.getValueOf('jupyterNotebookPlugin', 'notebookHeight')
            const isResponsive =
                this.getContentElement(
                    'jupyterNotebookPlugin',
                    'isResponsive'
                ).getValue() === true

            // get a nbviewer url to the provided notebook
            const url = convertUrlToNbViewerUrl(
                this.getValueOf('jupyterNotebookPlugin', 'notebookUrl')
            )

            // setup the iframe with responsive style if needed
            const iframeContent = `<details>  
                <summary>TITLE HERE</summary> 
                
                <iframe 
                    src="${url}"
                    ${!isResponsive && `width="${width}"`}
                    ${!isResponsive && `height="${height}"`}
                    ${
                        isResponsive &&
                        `style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"`
                    }
                    frameborder="0" 
                    allowfullscreen
                ></iframe>
            </details>`

            // the responsive container for the iframe, if needed
            // styles intentionally included inline as mEditor does not share a stylesheet with the documents consumer (e.g. the website)
            const responsiveIframe = `
                <div style="display: flex; flex-wrap: wrap;">
                    <div style="flex: 0 0 50%;">
                        <div style="width: 100%; overflow: hidden; position: relative; padding-bottom: 56.25%; height: 0;">
                            ${iframeContent}
                        </div>
                    </div>
                </div>
            </div>`

            // add iframe to the body at the users cursor location
            const element = CKEDITOR.dom.element
                .createFromHtml(`<div class="jupyter-notebook">
                ${isResponsive ? responsiveIframe : iframeContent}
            </div>`)

            const instance = this.getParentEditor()
            instance.insertElement(element)
        },
    }
}
