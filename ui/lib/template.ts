interface Replacer {
    [key: string]: string
}

export default function Template(str: string) {
    this.str = str
}

Template.prototype.replace = function replace(replacer: Replacer) {
    let result = this.str

    Object.keys(replacer).forEach(key => {
        result = result.replace(new RegExp(`{${key}}`, 'g'), replacer[key])
    })

    return result
}
