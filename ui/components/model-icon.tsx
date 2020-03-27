import {
    FaAddressBook,
    FaArchive,
    FaBell,
    FaCar,
    FaCameraRetro,
    FaCloud,
    FaBullhorn,
    FaComments,
    FaColumns,
    FaCode,
    FaDatabase,
    FaFile,
    FaFire,
    FaCube,
    FaInfo,
    FaListAlt,
    FaMicrochip,
    FaNewspaper,
    FaRegNewspaper,
    FaFax,
    FaFlag,
    FaPrint,
    FaPowerOff,
    FaQuestion,
    FaBook,
    FaSearch,
} from 'react-icons/fa'
import {
    MdWarning,
} from 'react-icons/md'
import styles from './model-icon.module.css'

const DEFAULT_ICON = 'FaFile'

const SUPPORTED_ICONS = {
    FaAddressBook,
    FaArchive,
    FaBell,
    FaCar,
    FaCameraRetro,
    FaCloud,
    FaBullhorn,
    FaComments,
    FaColumns,
    FaCode,
    FaDatabase,
    FaFile,
    FaFire,
    FaCube,
    FaInfo,
    FaListAlt,
    FaMicrochip,
    FaNewspaper,
    FaRegNewspaper,
    FaFax,
    FaFlag,
    FaPrint,
    FaPowerOff,
    FaQuestion,
    FaBook,
    FaSearch,
    MdWarning,
}

const ModelIcon = ({ name = '', color = '#000' }) => {
    // TODO: Model schema's icon list should use `FaIcon` naming style instead of `fa-icon` naming style, then refactor this
    let camelCasedIcon = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    camelCasedIcon = camelCasedIcon[0].toUpperCase() + camelCasedIcon.slice(1)

    // TODO: remove custom icons from the list
    if (camelCasedIcon == 'IHowto') {
        camelCasedIcon = 'FaBook'
    }

    if (camelCasedIcon == 'FaNewspaperO') {
        camelCasedIcon = 'FaRegNewspaper'
    }

    if (camelCasedIcon == 'FaWarning') {
        camelCasedIcon = 'MdWarning'
    }

    if (camelCasedIcon == 'FaFileText') {
        camelCasedIcon = 'FaRegFileAlt'
    }

    // use default icon if the supplied icon isn't in the list
    // model schema should really only contain the supported icons
    if (!(camelCasedIcon in SUPPORTED_ICONS)) {
        camelCasedIcon = DEFAULT_ICON
    }

    let Icon = SUPPORTED_ICONS[camelCasedIcon]

    return (
        <span className={styles.container} style={{ background: `${color}` }}>
            <Icon />
        </span>
    )
}

export default ModelIcon
