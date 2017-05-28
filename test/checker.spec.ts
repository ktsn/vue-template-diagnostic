import * as assert from 'power-assert'
import { parseExpression } from '../src/parser'
import { checkExpression } from '../src/checker'
import { SymbolTable } from '../src/symbols'
import { Type, TypeKind } from '../src/types'

describe('Type Checker', () => {
  const string: Type = { kind: TypeKind.String, name: 'string' }
  const number: Type = { kind: TypeKind.Number, name: 'number' }

  it('should not provide any errors if the expression is valid', () => {
    const { result } = parseExpression('foo + bar') as any
    const scope = new SymbolTable([
      {
        name: 'foo',
        type: number
      },
      {
        name: 'bar',
        type: number
      }
    ])
    const res = checkExpression(result, scope)
    assert(res.length === 0)
  })

  it('should provide an error if there are some undefined variables', () => {
    const { result } = parseExpression('foo + bar + 123') as any
    const scope = new SymbolTable([
      {
        name: 'foo',
        type: number
      }
    ])
    const res = checkExpression(result, scope)
    assert.deepStrictEqual(res, [
      {
        message: 'bar is not defined',
        start: 6,
        end: 9
      }
    ])
  })
})
