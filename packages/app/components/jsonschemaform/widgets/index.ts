import type { RegistryWidgetsType } from '@rjsf/utils'
import IconWidget from './IconWidget'
import CKEditorWidget from './CKEditorWidget'
import ImageWidget from './ImageWidget'
import MultiSelectWidget from './MultiSelectWidget'
import DateTimeWidget from './DateTimeWidget'
import ConcatenatedWidget from './ConcatenatedWidget'
import HtmlTextWidget from './HtmlTextWidget'
import TitlePropertyWidget from './TitlePropertyWidget'
import AnchorWidget from './AnchorWidget'

const widgets: RegistryWidgetsType = {
    ckeditor: CKEditorWidget,
    icon: IconWidget,
    image: ImageWidget,
    'multi-select': MultiSelectWidget,
    'date-time': DateTimeWidget,
    concatenated: ConcatenatedWidget,
    htmltext: HtmlTextWidget,
    titleproperty: TitlePropertyWidget,
    anchor: AnchorWidget,
}

export default widgets
