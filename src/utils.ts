export type Either<E, V> = Error<E> | Value<V>

export interface Error<E> {
  error: E,
  value?: null
}

export interface Value<V> {
  error?: null,
  value: V
}
