export const arcgisstorymap = {
    lang: ['en'],
    en: {
        button: 'Embed ArcGIS Story Map',
        title: 'Embed ArcGIS Story Map',
        txtUrl: 'Paste ArcGIS Story Map URL',
        txtWidth: 'Width (include px or %)',
        txtHeight: 'Height (include px or %)',
        invalidWidth: 'Please input a valid width (including unit, px or %)',
        invalidHeight: 'Please input a valid height (including unit, px or %)',
        chkAutoplay: 'Autoplay mode',
        noCode: 'You must input a URL',
        invalidUrl: "The URL you've entered doesn't appear to be valid",
        or: 'or',
    },
    init: function (editor) {
        editor.addCommand(
            'arcgisstorymap',
            new CKEDITOR.dialogCommand('arcgisstorymap', {
                allowedContent:
                    'div{*}(*); iframe{*}[!width,!height,!src,!frameborder,!allowfullscreen,!allow]; object param[*]; a[*]; img[*]',
            })
        )

        editor.ui.addButton('arcgisstorymap', {
            label: 'ArcGIS Story Map',
            toolbar: 'insert',
            command: 'arcgisstorymap',
            icon:
                window.location.origin +
                (window.location.href.indexOf('/meditor') >= 0 ? '/meditor' : '') +
                '/ckeditor/arcgis.png',
        })

        CKEDITOR.dialog.add('arcgisstorymap', function (instance) {
            var video

            return {
                title: editor.lang.arcgisstorymap.title,
                minWidth: 510,
                minHeight: 200,
                contents: [
                    {
                        id: 'arcgisstorymapPlugin',
                        expand: true,
                        elements: [
                            {
                                id: 'txtUrl',
                                type: 'text',
                                label: editor.lang.arcgisstorymap.txtUrl,
                                validate: function () {
                                    if (this.isEnabled()) {
                                        if (!this.getValue()) {
                                            alert(editor.lang.arcgisstorymap.noCode)
                                            return false
                                        } else {
                                            if (
                                                this.getValue().length === 0 ||
                                                this.getValue().indexOf('maps.arcgis.com') < 0
                                            ) {
                                                alert(editor.lang.arcgisstorymap.invalidUrl)
                                                return false
                                            }
                                        }
                                    }
                                },
                            },
                            {
                                type: 'text',
                                id: 'txtWidth',
                                width: '60px',
                                label: editor.lang.arcgisstorymap.txtWidth,
                                default:
                                    editor.config.arcgisstorymap_width != null
                                        ? editor.config.arcgisstorymap_width
                                        : '640px',
                                validate: function () {
                                    let width = this.getValue()

                                    if (!width || (width.indexOf('px') < 0 && width.indexOf('%') < 0)) {
                                        alert(editor.lang.arcgisstorymap.invalidWidth)
                                        return false
                                    }
                                },
                            },
                            {
                                type: 'text',
                                id: 'txtHeight',
                                width: '60px',
                                label: editor.lang.arcgisstorymap.txtHeight,
                                default:
                                    editor.config.arcgisstorymap_height != null
                                        ? editor.config.arcgisstorymap_height
                                        : '480px',
                                validate: function () {
                                    let height = this.getValue()

                                    if (!height || (height.indexOf('px') < 0 && height.indexOf('%') < 0)) {
                                        alert(editor.lang.arcgisstorymap.invalidHeight)
                                        return false
                                    }
                                },
                            },
                            {
                                id: 'chkAutoplay',
                                type: 'checkbox',
                                default:
                                    editor.config.arcgisstorymap_autoplay != null
                                        ? editor.config.arcgisstorymap_autoplay
                                        : false,
                                label: editor.lang.arcgisstorymap.chkAutoplay,
                            },
                        ],
                    },
                ],
                onOk: function () {
                    var content = ''

                    var url = this.getContentElement('arcgisstorymapPlugin', 'txtUrl').getValue(),
                        params = [],
                        paramAutoplay = ''
                    var width = this.getValueOf('arcgisstorymapPlugin', 'txtWidth')
                    var height = this.getValueOf('arcgisstorymapPlugin', 'txtHeight')

                    if (this.getContentElement('arcgisstorymapPlugin', 'chkAutoplay').getValue() === true) {
                        params.push('autoplay')
                        paramAutoplay = 'autoplay'
                    }

                    if (params.length > 0) {
                        url = url + '&' + params.join('&')
                    }

                    content +=
                        '<iframe ' +
                        (paramAutoplay ? 'allow="' + paramAutoplay + ';" ' : '') +
                        'width="' +
                        width +
                        '" height="' +
                        height +
                        '" src="' +
                        url +
                        '" '
                    content += 'frameborder="0" allowfullscreen></iframe>'

                    var element = CKEDITOR.dom.element.createFromHtml(content)
                    var instance = this.getParentEditor()
                    instance.insertElement(element)
                },
            }
        })
    },
}
