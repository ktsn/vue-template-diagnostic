import * as assert from 'power-assert'
import { parseExpression } from '../src/parser'

describe('Parser', () => {
  it('should parse template expression', () => {
    const { value } = parseExpression('1 + 2') as any
    assert(value.type === 'BinaryExpression')
    assert(value.operator === '+')
  })

  it('should provide an error if multiple expressions are provided', () => {
    const { error } = parseExpression('1 + 2; test()') as any
    assert(error === 'Template expression should have only one expression')
  })

  it('should provide an error if there is a syntax error', () => {
    const { error } = parseExpression('() =>> {}') as any
    assert(error === 'Line 1: Unexpected token >')
  })

  it('should provide an error if non-expression is provided', () => {
    const { error } = parseExpression('const a = 123') as any
    assert(error === 'Template expression must be an expression')
  })
})
