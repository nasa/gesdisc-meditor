module.exports.HttpBadRequestException = function HttpBadRequestException(
    message = 'Bad Request'
) {
    this.message = message
    this.status = 400

    this.toString = function () {
        return this.message
    }
}

module.exports.HttpNotFoundException = function HttpNotFoundException(
    message = 'Not Found'
) {
    this.message = message
    this.status = 404

    this.toString = function () {
        return this.message
    }
}
