export type Filter = Record<string, any>
export type Sort = Record<string, 1 | -1>
export type UpdateQuery<T> = {
    $set?: Partial<T>
    $unset?: Record<keyof T, 1>
    $push?: Record<keyof T, any>
    $pull?: Record<keyof T, any>
    [key: string]: any
}

export interface DatabaseConnection {
    connect(): Promise<void>
    disconnect(): Promise<void>
    collection(name: string): any
    ObjectId(id: string): any
}
