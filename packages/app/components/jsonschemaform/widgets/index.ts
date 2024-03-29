import type { RegistryWidgetsType } from '@rjsf/utils'
import IconWidget from './IconWidget'
import CKEditorWidget from './CKEditorWidget'
import ImageWidget from './ImageWidget'
import MultiSelectWidget from './MultiSelectWidget'
import DateTimeWidget from './DateTimeWidget'
import ConcatenatedWidget from './ConcatenatedWidget'
import HtmlTextWidget from './HtmlTextWidget'
import TitlePropertyWidget from './TitlePropertyWidget'

const widgets: RegistryWidgetsType = {
    ckeditor: CKEditorWidget,
    icon: IconWidget,
    image: ImageWidget,
    'multi-select': MultiSelectWidget,
    'date-time': DateTimeWidget,
    concatenated: ConcatenatedWidget,
    htmltext: HtmlTextWidget,
    titleproperty: TitlePropertyWidget,
}

export default widgets
