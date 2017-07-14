export type Failable<E, V> = Fail<E> | Success<V>

export interface Fail<E> {
  failed: true
  error: E
}

export interface Success<V> {
  failed: false
  value: V
}

export function fail<E>(err: E): Failable<E, any> {
  return { failed: true, error: err }
}

export function success<V>(val: V): Failable<any, V> {
  return { failed: false, value: val }
}

export function flatMap<T, R>(list: T[], fn: (val: T) => R[]): R[] {
  return list.reduce((acc, item) => {
    return acc.concat(fn(item))
  }, [] as R[])
}
