import IconWidget from './IconWidget'
import CKEditorWidget from './CKEditorWidget'
import ImageWidget from './ImageWidget'
import MultiSelectWidget from './MultiSelectWidget'
import DateTimeWidget from './DateTimeWidget'

const widgets = {
    ckeditor: CKEditorWidget,
    icon: IconWidget,
    image: ImageWidget,
    "multi-select": MultiSelectWidget,
    "date-time": DateTimeWidget,
}

export default widgets
