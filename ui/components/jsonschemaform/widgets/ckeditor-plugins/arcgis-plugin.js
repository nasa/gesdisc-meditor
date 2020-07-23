const VALID_SIZES = [
    ['100%', '800px'],
    ['100%', '640px'],
    ['800px', '600px'],
    ['640px', '480px'],
]

export const arcgisstorymap = {
    lang: ['en'],
    en: {
        button: 'Embed ArcGIS Story Map',
        title: 'Embed ArcGIS Story Map',
        txtUrl: 'Paste ArcGIS Story Map URL',
        txtSize: 'Size (width/height)',
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
                                type: 'select',
                                id: 'size',
                                label: editor.lang.arcgisstorymap.txtSize,
                                items: VALID_SIZES.map((size) => [size.join(' / ')]),
                                default: '640px / 480px',
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
                        var width = this.getValueOf('arcgisstorymapPlugin', 'size').split(' / ')[0]
                        var height = this.getValueOf('arcgisstorymapPlugin', 'size').split(' / ')[1]

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
