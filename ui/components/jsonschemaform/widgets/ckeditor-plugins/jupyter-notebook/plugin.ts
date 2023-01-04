// https://ckeditor.com/docs/ckeditor4/latest/guide/plugin_sdk_intro.html

import { jupyterNotebookDialog } from './dialog'

export const jupyterNotebook = {
    lang: ['en'],
    en: {
        // no support for other languages yet
    },
    init: function (editor) {
        // general command for allowing iframe embeds (CKEditor will remove the iframe if not included)
        editor.addCommand(
            'jupyterNotebook',
            new CKEDITOR.dialogCommand('jupyterNotebook', {
                allowedContent:
                    'div{*}(*); iframe{*}[!width,!height,!src,!frameborder,!allowfullscreen,!allow]; object param[*]; a[*]; img[*]',
            })
        )

        // the toolbar button the user clicks to embed a notebook
        editor.ui.addButton('Jupyter Notebook', {
            label: 'Embed Jupyter Notebook',
            toolbar: 'insert',
            command: 'jupyterNotebook',
            icon:
                window.location.origin +
                (window.location.href.indexOf('/meditor') >= 0 ? '/meditor' : '') +
                '/ckeditor/jupyter.png',
        })

        // the dialog that shows up when the user clicks the "Embed Jupyter Notebook" button
        CKEDITOR.dialog.add('jupyterNotebook', jupyterNotebookDialog)
    },
}
