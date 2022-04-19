import { isValidNotebookUrl } from './utils'

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
                                id: 'txtUrl',
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
                                id: 'txtWidth',
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
                                id: 'txtHeight',
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
                                id: 'chkResponsive',
                                type: 'checkbox',
                                label:
                                    'Make Responsive (ignore width and height, fit to width)',
                                default: false,
                            },
                        ],
                    },
                ],
            },
        ],
        onOk: function () {
            const width = this.getValueOf('jupyterNotebookPlugin', 'txtWidth')
            const height = this.getValueOf('jupyterNotebookPlugin', 'txtHeight')
            const isResponsive =
                this.getContentElement(
                    'jupyterNotebookPlugin',
                    'chkResponsive'
                ).getValue() === true

            // TODO: convert url to nbviewer
            let url = this.getValueOf('jupyterNotebookPlugin', 'txtUrl')

            // TODO: wrap if responsive
            /* 
                if () {
                    content +=
                        '<div class="youtube-embed-wrapper" style="position:relative;padding-bottom:56.25%;padding-top:30px;height:0;overflow:hidden">'
                    responsiveStyle = 'style="position:absolute;top:0;left:0;width:100%;height:100%"'
                }*/

            let iframeContent = `<div>
                <iframe 
                    src="${url}"
                    width="${width}"
                    height="${height}"
                    frameborder="0" 
                    allowfullscreen
                ></iframe>
            </div>`

            console.log('got all the way here ', iframeContent)

            // add iframe to the body at the users cursor location
            const element = CKEDITOR.dom.element.createFromHtml(iframeContent)
            const instance = this.getParentEditor()

            console.log('about to insert ', instance, element)

            instance.insertElement(element)
        },
    }
}
