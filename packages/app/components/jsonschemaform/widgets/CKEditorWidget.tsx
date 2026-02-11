import React from 'react'
import { CKEditor } from 'ckeditor4-react'
import * as plugins from './ckeditor-plugins/'
import type { WidgetProps } from '@rjsf/utils'

function registerPluginsWithCkEditorInstance(CKEDITOR) {
    Object.keys(plugins).forEach(key => {
        if (!CKEDITOR.plugins.get(key)) {
            try {
                CKEDITOR.plugins.add(key, plugins[key])

                // if language file included, set it up
                if ('en' in plugins[key]) {
                    CKEDITOR.plugins.setLang(key, 'en', plugins[key].en)
                }
            } catch (err) {
                console.error(err)
            }
        }
    })
}

function CKEditorWidget(props: WidgetProps) {
    const config = {
        mathJaxLib:
            'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
        toolbarGroups: [
            { name: 'clipboard', groups: ['clipboard', 'undo'] },
            { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
            { name: 'links' },
            { name: 'insert' },
            { name: 'forms' },
            { name: 'tools' },
            { name: 'document', groups: ['mode', 'document', 'doctools'] },
            { name: 'others' },
            '/',
            { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
            {
                name: 'paragraph',
                groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
            },
            { name: 'styles' },
            { name: 'colors' },
            { name: 'about' },
        ],
        removeButtons: 'Underline',
        format_tags: 'p;h1;h2;h3;pre',
        removeDialogTabs: 'image:advanced;link:upload;link:advanced',
        autoGrow_onStartup: true,
        autoGrow_bottomSpace: 30,
        filebrowserUploadUrl: props.formContext.imageUploadUrl || '/images/upload',
        filebrowserUploadMethod: 'form',
        extraPlugins: 'youtube,arcgisstorymap,indentblock,worldview,jupyterNotebook',
        extraAllowedContent: 'iframe(*)',
        allowedContent: true,
        contentsCss: [
            'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css',
        ], // adds bootstrap styles to the ckeditor iframe
        bodyClass: 'm-3', // bootstrap removes body margin, but for ckeditor we need a bit of space around the content
    }

    // TODO: support disabled

    return (
        <CKEditor
            config={config}
            initData={props.value}
            onBlur={event => {
                let value = event.editor.getData() || undefined
                props.onBlur(props.id, value)
            }}
            onChange={event => {
                let value = event.editor.getData() || undefined
                props.onChange(value)
            }}
            onInstanceReady={event => {
                event.editor.setReadOnly(props.readonly || false)
            }}
            onBeforeLoad={CKEDITOR => {
                CKEDITOR.config.versionCheck = false
                CKEDITOR.disableAutoInline = true

                registerPluginsWithCkEditorInstance(CKEDITOR)
            }}
        />
    )
}

export default CKEditorWidget
