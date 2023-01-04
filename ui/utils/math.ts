// adapted from MDN docs on Math.random()
export function getRandomIntInclusive(min: number, max: number) {
    const minInt = Math.ceil(min)
    const maxInt = Math.floor(max)

    return Math.floor(Math.random() * (maxInt - minInt + 1) + min) //The maximum is inclusive and the minimum is inclusive
}
