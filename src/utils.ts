export type Either<E, R> = Error<E> | Result<R>

export interface Error<E> {
  error: E,
  result?: null
}

export interface Result<R> {
  error?: null,
  result: R
}
