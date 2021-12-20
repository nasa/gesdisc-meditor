module.exports.HttpNotFoundException = function HttpNotFoundException(
    message = 'Not Found'
) {
    this.message = message
    this.status = 404

    this.toString = function () {
        return this.message
    }
}
