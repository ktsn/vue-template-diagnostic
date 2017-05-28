export enum TypeKind {
  Any,
  String,
  Number,
  Boolean,
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
