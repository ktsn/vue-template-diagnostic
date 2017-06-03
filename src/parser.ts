import { Expression } from 'estree'
import { parse } from 'esprima'
import { Type } from './type'
import { Failable, fail, success } from './utils'

export function parseExpression(expression: string): Failable<string, Expression> {
  let program
  try {
    program = parse(expression, {
      range: true
    })
  } catch (err) {
    return fail(err.message)
  }

  if (program.body.length >= 2) {
    return fail('Template expression should have only one expression')
  }

  const statement = program.body[0]
  if (statement.type !== 'ExpressionStatement') {
    return fail('Template expression must be an expression')
  }

  return success(statement.expression)
}
