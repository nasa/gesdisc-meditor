import { default as BSPagination } from 'react-bootstrap/Pagination'

const MAX_PAGES_VISIBLE = 5 // make sure this is an odd number!

const Pagination = ({ onPageChange, currentPage, totalItems, itemsPerPage }) => {
    const lastPage = Math.ceil(totalItems / itemsPerPage) - 1
    const onFirstPage = currentPage <= 0
    const onLastPage = currentPage >= lastPage

    function renderItem(pageNum) {
        return (
            <BSPagination.Item key={pageNum} active={pageNum == currentPage} onClick={() => onPageChange(pageNum)}>
                {pageNum + 1}
            </BSPagination.Item>
        )
    }

    function renderItems() {
        let midPoint = (MAX_PAGES_VISIBLE - 1) / 2
        let startingPage = currentPage - midPoint < 0 ? 0 : currentPage - midPoint
        let endingPage = startingPage + MAX_PAGES_VISIBLE - 1

        if (endingPage > lastPage) {
            startingPage = lastPage - MAX_PAGES_VISIBLE + 1
            endingPage = lastPage
        }

        let items = []

        for (let i = startingPage; i <= endingPage; i++) {
            items.push(renderItem(i))
        }

        return items
    }

    return (
        <BSPagination>
            <BSPagination.First disabled={onFirstPage} onClick={() => onPageChange(0)} />
            <BSPagination.Prev disabled={onFirstPage} onClick={() => onPageChange(currentPage - 1)} />

            {currentPage > MAX_PAGES_VISIBLE - 1 && (
                <BSPagination.Ellipsis onClick={() => onPageChange(currentPage - MAX_PAGES_VISIBLE)} />
            )}

            {renderItems()}

            {currentPage < lastPage - MAX_PAGES_VISIBLE + 1 && (
                <BSPagination.Ellipsis onClick={() => onPageChange(currentPage + MAX_PAGES_VISIBLE)} />
            )}

            <BSPagination.Next disabled={onLastPage} onClick={() => onPageChange(currentPage + 1)} />
            <BSPagination.Last disabled={onLastPage} onClick={() => onPageChange(lastPage)} />
        </BSPagination>
    )
}

export default Pagination
