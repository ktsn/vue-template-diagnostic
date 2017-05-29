import { Expression } from 'estree'
import { parse } from 'esprima'
import { Type } from './types'
import { Either } from './utils'

export function parseExpression(expression: string): Either<string, Expression> {
  let program
  try {
    program = parse(expression, {
      range: true
    })
  } catch (err) {
    return { error: err.message }
  }

  if (program.body.length >= 2) {
    return {
      error: 'Template expression should have only one expression'
    }
  }

  const statement = program.body[0]
  if (statement.type !== 'ExpressionStatement') {
    return {
      error: 'Template expression must be an expression'
    }
  }

  return {
    value: statement.expression
  }
}
