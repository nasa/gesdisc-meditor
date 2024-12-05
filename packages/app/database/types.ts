export interface DatabaseRepositoryInterface<T> {
    findAll(collection: string): Promise<T[]>
    find(collection: string, title: string, titleProperty?: string): Promise<T>
}
