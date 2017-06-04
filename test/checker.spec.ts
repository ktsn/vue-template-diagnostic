import * as assert from 'power-assert'
import { parseExpression } from '../src/parser'
import { checkExpression } from '../src/checker'
import { SimpleSymbolTable, Symbol } from '../src/symbol'
import { Diagnostic } from '../src/diagnostic'
import { number, string, boolean, func, obj, typeRepository } from './stubs/type-repository'

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

  describe('member expression', () => {
    it('should pass if a parent object has an appropriate property', () => {
      test('foo.bar.baz', [], [
        {
          name: 'foo',
          type: obj('Foo', [{
            name: 'bar',
            type: obj('Bar', [{
              name: 'baz',
              type: string
            }])
          }])
        }
      ])
    })

    it('should report if a parent object does not have any appropriate properties', () => {
      test('foo.bar.baz', [
        {
          message: `Property 'baz' does not exist on type 'number'`,
          start: 0,
          end: 11
        }
      ], [
        {
          name: 'foo',
          type: obj('Foo', [{
            name: 'bar',
            type: number
          }])
        }
      ])
    })
  })

  describe('update operator', () => {
    it('should pass with a number type', () => {
      test('foo++', [], [
        {
          name: 'foo',
          type: number
        }
      ])
    })

    it('should report with a string type', () => {
      test('--bar', [
        {
          message: `The operand of the '--' must be of type 'any' or 'number'`,
          start: 0,
          end: 5
        }
      ], [
        {
          name: 'bar',
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
          type: obj('Bar')
        },
        {
          name: 'Bar',
          type: func
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
          type: func
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
          type: obj('Bar')
        },
        {
          name: 'bar',
          type: obj('Bar')
        }
      ])
    })

    it('should pass an "in" operator with string and object', () => {
      test('str in {}', [], [
        {
          name: 'str',
          type: string
        }
      ])
    })

    it('should report if the left-hand side of "in" operator is not a number, string or symbol', () => {
      test('foo in bar', [
        {
          message: `The left-hand side of a 'in' operator must be of type 'any', 'number', 'string' or 'symbol'`,
          start: 0,
          end: 3
        }
      ], [
        {
          name: 'foo',
          type: boolean
        },
        {
          name: 'bar',
          type: obj('Object')
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
  const res = checkExpression(value, new SimpleSymbolTable(scope), typeRepository)
  assert.deepStrictEqual(res, diagnostics)
}
