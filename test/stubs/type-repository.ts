import { SimpleSymbolTable, SymbolTable } from '../../src/symbols'
import { Type, TypeKind, TypeRepository, AnyTypeArguments, anyType, nullType, undefinedType } from '../../src/types'

const emptyMembers = new SimpleSymbolTable([])

export const number: Type = {
  name: 'number',
  kind: TypeKind.Number,
  members: emptyMembers,
  callSignatures: []
}

export const string: Type = {
  name: 'string',
  kind: TypeKind.String,
  members: emptyMembers,
  callSignatures: []
}

export const boolean: Type = {
  name: 'boolean',
  kind: TypeKind.Boolean,
  members: emptyMembers,
  callSignatures: []
}

export const func: Type = {
  name: 'Function',
  kind: TypeKind.Other,
  members: emptyMembers,
  callSignatures: [{
    argTypes: new AnyTypeArguments(),
    returnType: anyType
  }]
}

export function obj(name: string, members: SymbolTable = emptyMembers) {
  return {
    name,
    kind: TypeKind.Other,
    members,
    callSignatures: []
  }
}

export const typeRepository: TypeRepository = {
  getTypeByKind(kind: TypeKind) {
    switch (kind) {
      case TypeKind.Number:
        return number
      case TypeKind.String:
        return string
      case TypeKind.Boolean:
        return boolean
      case TypeKind.Null:
        return nullType
      case TypeKind.Undefined:
        return undefinedType
      case TypeKind.Any:
        return anyType
      default:
        throw new Error(`Unknown type kind ${kind}`)
    }
  }
}
