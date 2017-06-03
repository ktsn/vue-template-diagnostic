import * as assert from 'assert'
import * as ts from 'typescript'
import { Symbol, SimpleSymbolTable, SymbolTable } from './symbols'
import { Type, TypeKind, TypeRepository, TypeArguments, SimpleTypeArguments, CallSignature, anyType, nullType, undefinedType } from './types'

export interface TypeScriptContext {
  ts: typeof ts
  program: ts.Program
  checker: ts.TypeChecker
  node: ts.Node
}

export class TypeScriptSymbol implements Symbol {
  constructor(
    private tsSymbol: ts.Symbol,
    private context: TypeScriptContext
  ) {}

  get name(): string {
    return this.tsSymbol.getName()
  }

  get type(): Type {
    const { checker, node } = this.context
    const type = checker.getTypeOfSymbolAtLocation(this.tsSymbol, node)
    return new TypeScriptType(type, this.context)
  }
}

export class TypeScriptType implements Type {
  constructor(
    private tsType: ts.Type,
    private context: TypeScriptContext
  ) {}

  get name(): string {
    const symbol = this.tsType.symbol
    if (!symbol) return '<anonymous>'
    return symbol.getName()
  }

  get kind(): TypeKind {
    const { ts } = this.context
    const flags = this.tsType.flags

    // Borrowed and modified from @angular/compiler-cli
    // Copyright (c) 2014-2017 Google, Inc. http://angular.io
    if (flags & ts.TypeFlags.Any) {
      return TypeKind.Any
    } else if (
      flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLike | ts.TypeFlags.BooleanLiteral)
    ) {
      return TypeKind.Boolean
    } else if (
      flags & (ts.TypeFlags.String | ts.TypeFlags.StringLike | ts.TypeFlags.StringLiteral)
    ) {
      return TypeKind.String
    } else if (flags & (ts.TypeFlags.Number | ts.TypeFlags.NumberLike)) {
      return TypeKind.Number
    } else if (flags & ts.TypeFlags.Undefined) {
      return TypeKind.Undefined
    } else if (flags & ts.TypeFlags.Null) {
      return TypeKind.Null
    }

    return TypeKind.Other
  }

  private _members: SymbolTable | null
  get members(): SymbolTable {
    if (!this._members) {
      const symbols = this.tsType.getProperties().map(s => {
        return new TypeScriptSymbol(s, this.context)
      })
      this._members = new SimpleSymbolTable(symbols)
    }
    return this._members
  }

  private _callSignatures: CallSignature[] | null = null
  get callSignatures(): CallSignature[] {
    if (!this._callSignatures) {
      const { checker, node } = this.context
      const signatures = this.tsType.getCallSignatures()

      this._callSignatures = signatures.map(s => {
        const args = s.getParameters()
          .map(p => {
            const type = checker.getTypeOfSymbolAtLocation(p, node)
            return new TypeScriptType(type, this.context)
          })

        const ret = new TypeScriptType(s.getReturnType(), this.context)

        return {
          argTypes: new SimpleTypeArguments(args),
          returnType: ret
        }
      })
    }
    return this._callSignatures
  }
}

export class TypeScriptTypeRepository implements TypeRepository {
  private cached = false
  private cache = new Map<TypeKind, Type>()

  constructor(private context: TypeScriptContext) {}

  getTypeByKind(kind: TypeKind): Type {
    assert(kind !== TypeKind.Other, 'Cannot specify a type from TypeKind.Other')

    if (kind === TypeKind.Any) return anyType
    if (kind === TypeKind.Null) return nullType
    if (kind === TypeKind.Undefined) return undefinedType

    this.ensureLoadBuiltInTypes()

    let res: Type | undefined
    switch (kind) {
      case TypeKind.String:
        res = this.cache.get(TypeKind.String)
        break
      case TypeKind.Number:
        res = this.cache.get(TypeKind.Number)
        break
      case TypeKind.Boolean:
        res = this.cache.get(TypeKind.Boolean)
        break
      default:
        throw new Error(`Unexpected type kind ${kind}`)
    }

    assert(res, `A type of the type kind ${kind} is not found`)

    return res!
  }

  private ensureLoadBuiltInTypes(): void {
    if (this.cached) return
    this.cached = true

    const lib = this.context.program.getSourceFile('typescript/lib/lib.d.ts')
    const { checker, ts } = this.context

    let res: Type
    this.context.ts.forEachChild(lib, node => {
      if (node.kind !== ts.SyntaxKind.InterfaceDeclaration) return

      switch ((node as ts.InterfaceDeclaration).name.text) {
        case 'String':
          this.cache.set(
            TypeKind.String,
            new TypeScriptType(checker.getTypeAtLocation(node), this.context)
          )
          break
        case 'Number':
          this.cache.set(
            TypeKind.Number,
            new TypeScriptType(checker.getTypeAtLocation(node), this.context)
          )
          break
        case 'Boolean':
          this.cache.set(
            TypeKind.Boolean,
            new TypeScriptType(checker.getTypeAtLocation(node), this.context)
          )
        default:
          // Do nothing
      }
    })
  }
}
