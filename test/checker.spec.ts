import * as assert from 'power-assert'
import { parseExpression } from '../src/parser'
import { checkExpression } from '../src/checker'
import { SymbolTable, Symbol } from '../src/symbols'
import { Diagnostic } from '../src/diagnostic'
import { Type, TypeKind, BuiltIn } from '../src/types'

const { number, string } = BuiltIn

const func = {
  name: 'Function',
  kind: TypeKind.Function
} as Type

describe('Type Checker', () => {
  it('should report if there are some undefined variables', () => {
    test('foo + bar + 123', [
      {
        message: '\'bar\' is not defined',
        start: 6,
        end: 9
      }
    ], [
      {
        name: 'foo',
        type: number
      }
    ])
  })

  describe('call expression', () => {
    it('should pass a call expression for function type', () => {
      test('test(1 + 3)', [], [
        {
          name: 'test',
          type: func
        }
      ])
    })

    it('should report a call expression without any call signatures', () => {
      test('12 + foo("bar")', [
        {
          message: `Type 'string' has no compatible call signatures`,
          start: 5,
          end: 15
        }
      ], [
        {
          name: 'foo',
          type: string
        }
      ])
    })
  })

  describe('binary operator', () => {
    it('should pass a "+" operator with numbers', () => {
      test('1 + 2 + 3')
    })

    it('should pass a "+" operator with strings', () => {
      test('"1" + 2 + null')
    })

    it('should report if there is a "+" operator with number and boolean', () => {
      test('1 + true', [
        {
          message: `The binary operator '+' cannot be applied to type 'number' and 'boolean'`,
          start: 0,
          end: 8
        }
      ])
    })

    it('should pass a "===" operator with the same types', () => {
      test('12 === 456')
    })

    it('should report if a "!==" operator used with different types', () => {
      test('123 !== true', [
        {
          message: `The binary operator '!==' cannot be applied to types 'number' and 'boolean'`,
          start: 0,
          end: 12
        }
      ])
    })

    it('should pass an arithmetic operator with numbers', () => {
      test('123 * 456 / 789 - 30')
    })

    it('should report if an arithmetic operator with other than number', () => {
      test('true - 42', [
        {
          message: `The left-hand side of a binary operator '-' must be of type 'number' or 'any'`,
          start: 0,
          end: 4
        }
      ])

      test('12 - 3 * "foo"', [
        {
          message: `The right-hand side of a binary operator '*' must be of type 'number' or 'any'`,
          start: 9,
          end: 14
        }
      ])
    })

    it('should pass an "instanceof" with object and function', () => {
      test('foo instanceof Bar', [], [
        {
          name: 'foo',
          type: {
            name: 'Bar',
            kind: TypeKind.Object
          }
        },
        {
          name: 'Bar',
          type: {
            name: 'typeof Bar',
            kind: TypeKind.Function
          }
        }
      ])
    })

    it('should report if the left-hand side of an "instanceof" is not an object', () => {
      test('123 instanceof Bar', [
        {
          message: `The left-hand side of 'instanceof' must be of type 'any' or 'object'`,
          start: 0,
          end: 3
        }
      ], [
        {
          name: 'Bar',
          type: {
            name: 'typeof Bar',
            kind: TypeKind.Function
          }
        }
      ])
    })

    it('should report if the right-hand side of an "instanceof" is not a function', () => {
      test('foo instanceof bar',[
        {
          message: `The right-hand side of 'instanceof' must be of type 'any' or 'Function'`,
          start: 15,
          end: 18
        }
      ], [
        {
          name: 'foo',
          type: {
            name: 'Bar',
            kind: TypeKind.Object
          }
        },
        {
          name: 'bar',
          type: {
            name: 'Bar',
            kind: TypeKind.Object
          }
        }
      ])
    })

    it('should pass an "in" operator with symbol and object', () => {
      test('sym in {}', [], [
        {
          name: 'sym',
          type: BuiltIn.symbol
        }
      ])
    })

    it('should report if the left-hand side of "in" operator is not a number, string or symbol', () => {
      test('foo in {}', [
        {
          message: `The left-hand side of a 'in' operator must be of type 'any', 'number', 'string' or 'symbol'`,
          start: 0,
          end: 3
        }
      ], [
        {
          name: 'foo',
          type: BuiltIn.boolean
        }
      ])
    })

    it('should report if the right-hand side of "in" operator is not an object', () => {
      test('"key" in null', [
        {
          message: `The right-hand side of a 'in' operator must be of type 'any' or 'object'`,
          start: 9,
          end: 13
        }
      ])
    })
  })
})

function test(
  expression: string,
  diagnostics: Diagnostic[] = [],
  scope: Symbol[] = []
) {
  const { value } = parseExpression(expression) as any
  const res = checkExpression(value, new SymbolTable(scope))
  assert.deepStrictEqual(res, diagnostics)
}
