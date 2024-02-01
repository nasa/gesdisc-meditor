import React, { useState, useEffect } from 'react'
import IconButton from '../components/IconButton'
import { handleResponseErrors } from '../utils/error'
import type { WidgetProps } from '@rjsf/utils'
import { getTemplate } from '@rjsf/utils'

const UPLOAD_IDLE = ''
const UPLOAD_IN_PROGRESS = 'uploading'
const UPLOAD_FAILED = 'upload failed'

export default function ImageWidget(props: WidgetProps) {
    let fileEl = React.createRef<HTMLInputElement>()

    const [uploadState, setUploadState] = useState(UPLOAD_IDLE)
    const [currentImagePath, setCurrentImagePath] = useState('')
    const [imageUploadUrl, setImageUploadUrl] = useState(
        props.formContext.imageUploadUrl || '/images/upload'
    )

    useEffect(() => {
        setCurrentImagePath(props.value)
        setImageUploadUrl(props.formContext.imageUploadUrl)
    }, [props.value, props.formContext.imageUploadUrl])

    function handleFileChanged(file) {
        setUploadState(UPLOAD_IN_PROGRESS)

        let formData = new FormData()
        formData.append('upload', file)

        fetch(imageUploadUrl, {
            method: 'POST',
            body: formData,
        })
            .then(handleResponseErrors)
            .then(res => res.json())
            .then(res => {
                setCurrentImagePath(res.location)
                props.onChange(res.location)
                setUploadState(UPLOAD_IDLE)
            })
            .catch(() => setUploadState(UPLOAD_FAILED))
    }

    const BaseInput = getTemplate('BaseInputTemplate', props.registry)

    return (
        <div className="image-widget-content">
            <BaseInput {...props} value={currentImagePath} type="text" />

            {!props.readonly && (
                <IconButton
                    icon="cloud-upload"
                    onClick={() => fileEl.current.click()}
                    style={{ marginTop: 10 }}
                >
                    Upload {props.label}
                </IconButton>
            )}

            <input
                type="file"
                accept="image/jpg, image/gif, image/jpeg, image/png"
                style={{ display: 'none' }}
                ref={fileEl}
                onChange={e => handleFileChanged(e.target.files[0])}
                readOnly={props.readonly}
            />

            {uploadState === UPLOAD_IN_PROGRESS && (
                <div>
                    <p>
                        <strong>Uploading image...</strong>
                    </p>
                </div>
            )}

            {uploadState === UPLOAD_FAILED && (
                <div>
                    <ul className="error-detail bs-callout bs-callout-info">
                        <li className="text-danger">Failed to upload image</li>
                    </ul>
                </div>
            )}

            {currentImagePath && (
                <div style={{ marginTop: 10 }}>
                    <p>Preview:</p>
                    <img
                        id="preview"
                        src={currentImagePath}
                        alt="Preview"
                        style={{ maxWidth: '100%' }}
                    />
                </div>
            )}
        </div>
    )
}
