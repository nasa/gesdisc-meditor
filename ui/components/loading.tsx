import Spinner from 'react-bootstrap/Spinner'

const Loading = ({ text = '' }) => {
    return (
        <div className="d-flex align-items-center ml-2">
            <Spinner animation="border" role="status" size="sm" variant="primary">
                <span className="sr-only">Loading...</span>
            </Spinner>

            {text && <span className="ml-2">{text}</span>}
        </div>
    )
}

export default Loading
