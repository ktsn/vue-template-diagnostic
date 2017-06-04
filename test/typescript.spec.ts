import * as ts from 'typescript'
import * as assert from 'power-assert'
import { TypeScriptTypeRepository } from '../src/typescript'
import { TypeKind, TypeRepository } from '../src/type'

describe('TypeScript adapters', () => {
  const program = ts.createProgram([], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ES2015,
    moduleResolution: ts.ModuleResolutionKind.NodeJs
  })
  const checker = program.getTypeChecker()
  const context = {
    ts,
    program,
    checker
  }

  describe('type repository', () => {
    const repo: TypeRepository = new TypeScriptTypeRepository(context)

    it('should give the string type', () => {
      const res = repo.getTypeByKind(TypeKind.String)
      assert(res.kind === TypeKind.String)
      assert(res.name === 'string')
    })

    it('should give the number type', () => {
      const res = repo.getTypeByKind(TypeKind.Number)
      assert(res.kind === TypeKind.Number)
      assert(res.name === 'number')
    })

    it('should give the boolean type', () => {
      const res = repo.getTypeByKind(TypeKind.Boolean)
      assert(res.kind === TypeKind.Boolean)
      assert(res.name === 'boolean')
    })

    it('should give the symbol type', () => {
      const res = repo.getTypeByKind(TypeKind.Symbol)
      assert(res.kind === TypeKind.Symbol)
      assert(res.name === 'symbol')
    })

    it('should give the null type', () => {
      const res = repo.getTypeByKind(TypeKind.Null)
      assert(res.kind === TypeKind.Null)
      assert(res.name === 'null')
    })

    it('should give the undefined type', () => {
      const res = repo.getTypeByKind(TypeKind.Undefined)
      assert(res.kind === TypeKind.Undefined)
      assert(res.name === 'undefined')
    })

    it('should give the any type', () => {
      const res = repo.getTypeByKind(TypeKind.Any)
      assert(res.kind === TypeKind.Any)
      assert(res.name === 'any')
    })
  })
})
