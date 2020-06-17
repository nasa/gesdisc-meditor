module.exports.chunkArray = function(arrayToChunk, sizeOfChunks) {
    return Array.from({ length: Math.ceil(arrayToChunk.length / sizeOfChunks) }).map((_, i) =>
        Array.from({ length: sizeOfChunks }).map((_, j) => arrayToChunk[i * sizeOfChunks + j])
    )
}
