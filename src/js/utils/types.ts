export type Option<T> = T | null
export type Maybe<T> = T | null | undefined

export type Dict<T> = { [key: string]: T }

export type ValueOf<T> = T[keyof T]

export type JsonPrimitive = string | number | boolean | null
export type JsonArray = JsonData[]
export type JsonObject = { [key: string]: JsonData }
export type JsonData = JsonPrimitive | JsonArray | JsonObject
