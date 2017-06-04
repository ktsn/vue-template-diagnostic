import { SymbolTable, SimpleSymbolTable, AnySymbolTable } from './symbol'

export enum TypeKind {
  Any,
  String,
  Number,
  Boolean,
  Null,
  Undefined,
  Other
}

export interface Type {
  name: string
  kind: TypeKind
  members: SymbolTable
  callSignatures: CallSignature[]
}

export interface TypeRepository {
  getTypeByKind(kind: TypeKind): Type
}

export interface CallSignature {
  argTypes: TypeArguments
  returnType: Type
}

export interface TypeArguments {
  readonly length: number
  get(index: number): Type
}

export class AnyTypeArguments implements TypeArguments {
  get length() {
    return Number.POSITIVE_INFINITY
  }

  get(index: number): Type {
    return new AnyType()
  }
}

export class SimpleTypeArguments implements TypeArguments {
  constructor(private types: Type[]) {}

  get length() {
    return this.types.length
  }

  get(index: number): Type {
    return this.types[index]
  }
}

export class AnyType implements Type {
  name = 'any'
  kind = TypeKind.Any
  members = new AnySymbolTable()
  callSignatures = [{
    argTypes: new AnyTypeArguments(),
    returnType: this as AnyType
  }]
}
export const anyType = new AnyType()

export class NullType implements Type {
  name = 'null'
  kind = TypeKind.Null
  members = new SimpleSymbolTable([])
  callSignatures = []
}
export const nullType = new NullType()

export class UndefinedType implements Type {
  name = 'undefined'
  kind = TypeKind.Undefined
  members = new SimpleSymbolTable([])
  callSignatures = []
}
export const undefinedType = new UndefinedType()

export function unionType(...types: Type[]): Type {
  let result: Type | undefined = types[0]
  for (let i = 1; i < types.length; ++i) {
    if (result !== types[i]) {
      result = undefined
      break
    }
  }
  return result || anyType
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

export function isAny(type: Type): boolean {
  return type.kind === TypeKind.Any
}

export function isNumber(type: Type): boolean {
  return type.kind === TypeKind.Number
}

export function isString(type: Type): boolean {
  return type.kind === TypeKind.String
}

export function isFunction(type: Type): boolean {
  return type.callSignatures.length > 0
}

export function isObject(type: Type): boolean {
  return type.kind === TypeKind.Other
}
