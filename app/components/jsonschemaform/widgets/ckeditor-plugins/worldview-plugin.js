export const worldview = {
    lang: ['en'],
    en: {
        button: 'Embed Worldview',
        title: 'Embed Worldview',
        txtUrl: 'Paste Worldview URL',
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
            'worldview',
            new CKEDITOR.dialogCommand('worldview', {
                allowedContent:
                    'div{*}(*); iframe{*}[!width,!height,!src,!frameborder,!allowfullscreen,!allow]; object param[*]; a[*]; img[*]',
            })
        )

        editor.ui.addButton('worldview', {
            label: 'Embed Worldview',
            toolbar: 'insert',
            command: 'worldview',
            icon:
                window.location.origin +
                (window.location.href.indexOf('/meditor') >= 0 ? '/meditor' : '') +
                '/ckeditor/worldview.png',
        })

        CKEDITOR.dialog.add('worldview', function (instance) {
            var video

            return {
                title: editor.lang.worldview.title,
                minWidth: 510,
                minHeight: 200,
                contents: [
                    {
                        id: 'worldviewPlugin',
                        expand: true,
                        elements: [
                            {
                                id: 'txtUrl',
                                type: 'text',
                                label: editor.lang.worldview.txtUrl,
                                validate: function () {
                                    if (this.isEnabled()) {
                                        if (!this.getValue()) {
                                            alert(editor.lang.worldview.noCode)
                                            return false
                                        } else {
                                            if (
                                                this.getValue().length === 0 ||
                                                this.getValue().indexOf(
                                                    'https://worldview.earthdata.nasa.gov/'
                                                ) < 0
                                            ) {
                                                alert(
                                                    editor.lang.worldview.invalidUrl
                                                )
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
                                label: editor.lang.worldview.txtWidth,
                                default:
                                    editor.config.worldview_width != null
                                        ? editor.config.worldview_width
                                        : '640px',
                                validate: function () {
                                    let width = this.getValue()

                                    if (
                                        !width ||
                                        (width.indexOf('px') < 0 &&
                                            width.indexOf('%') < 0)
                                    ) {
                                        alert(editor.lang.worldview.invalidWidth)
                                        return false
                                    }
                                },
                            },
                            {
                                type: 'text',
                                id: 'txtHeight',
                                width: '60px',
                                label: editor.lang.worldview.txtHeight,
                                default:
                                    editor.config.worldview_height != null
                                        ? editor.config.worldview_height
                                        : '480px',
                                validate: function () {
                                    let height = this.getValue()

                                    if (
                                        !height ||
                                        (height.indexOf('px') < 0 &&
                                            height.indexOf('%') < 0)
                                    ) {
                                        alert(editor.lang.worldview.invalidHeight)
                                        return false
                                    }
                                },
                            },
                            {
                                id: 'chkAutoplay',
                                type: 'checkbox',
                                default:
                                    editor.config.worldview_autoplay != null
                                        ? editor.config.worldview_autoplay
                                        : false,
                                label: editor.lang.worldview.chkAutoplay,
                            },
                        ],
                    },
                ],
                onOk: function () {
                    var content = ''

                    var url = this.getContentElement(
                            'worldviewPlugin',
                            'txtUrl'
                        ).getValue(),
                        params = [],
                        paramAutoplay = ''
                    var width = this.getValueOf('worldviewPlugin', 'txtWidth')
                    var height = this.getValueOf('worldviewPlugin', 'txtHeight')

                    if (
                        this.getContentElement(
                            'worldviewPlugin',
                            'chkAutoplay'
                        ).getValue() === true
                    ) {
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
