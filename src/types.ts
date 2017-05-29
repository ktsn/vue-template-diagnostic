export enum TypeKind {
  Any,
  String,
  Number,
  Boolean,
  Symbol,
  Null,
  Undefined,
  Array,
  Object,
  Function
}

export type Type =
  Any
  | String
  | Number
  | Boolean
  | Symbol
  | Null
  | Undefined
  | Array
  | Object
  | Function

export interface BaseType {
  name: string
  kind: TypeKind
}

export interface Any extends BaseType {
  kind: TypeKind.Any
}

export interface String extends BaseType {
  kind: TypeKind.String
}

export interface Number extends BaseType {
  kind: TypeKind.Number
}

export interface Boolean extends BaseType {
  kind: TypeKind.Boolean
}

export interface Symbol extends BaseType {
  kind: TypeKind.Symbol
}

export interface Null extends BaseType {
  kind: TypeKind.Null
}

export interface Undefined extends BaseType {
  kind: TypeKind.Undefined
}

export interface Array extends BaseType {
  kind: TypeKind.Array
}

export interface Object extends BaseType {
  kind: TypeKind.Object
}

export interface Function extends BaseType {
  kind: TypeKind.Function
}

export const BuiltIn = {
  any: {
    name: 'any',
    kind: TypeKind.Any
  } as Type,
  string: {
    name: 'string',
    kind: TypeKind.String
  } as Type,
  number: {
    name: 'number',
    kind: TypeKind.Number
  } as Type,
  boolean: {
    name: 'boolean',
    kind: TypeKind.Boolean
  } as Type,
  symbol: {
    name: 'symbol',
    kind: TypeKind.Symbol
  } as Type,
  null: {
    name: 'null',
    kind: TypeKind.Null
  } as Type,
  undefined: {
    name: 'undefined',
    kind: TypeKind.Undefined
  } as Type
}

export function subtypeOf(sub: Type, parent: Type): boolean {
  if (
    sub.kind === TypeKind.Any
    || parent.kind === TypeKind.Any
  ) {
    return true
  }

  if (sub.kind === parent.kind) return true

  return false
}

export function isAny(type: Type): type is Any {
  return type.kind === TypeKind.Any
}

export function isNumber(type: Type): type is Number {
  return type.kind === TypeKind.Number
}

export function isString(type: Type): type is String {
  return type.kind === TypeKind.String
}

export function isSymbol(type: Type): type is Symbol {
  return type.kind === TypeKind.Symbol
}

export function isFunction(type: Type): type is Function {
  return type.kind === TypeKind.Function
}

export function isObject(type: Type): type is Object {
  return type.kind === TypeKind.Object
    || type.kind === TypeKind.Array
    || type.kind === TypeKind.Function
}
