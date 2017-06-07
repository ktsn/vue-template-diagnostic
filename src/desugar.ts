import * as ESTree from 'estree'

export function desugarListener(exp: ESTree.Expression, native: boolean): ESTree.Expression {
  // If the expression is identifier, it's a shorthand of `foo($event)`
  if (exp.type === 'Identifier') {
    return exp
  }

  let param: ESTree.Pattern
  if (native) {
    // ($event) => exp
    param = {
      type: 'Identifier',
      name: '$event'
    }
  } else {
    // (...arguments) => exp
    param = {
      type: 'RestElement',
      argument: {
        type: 'Identifier',
        name: 'arguments'
      }
    }
  }

  return {
    type: 'ArrowFunctionExpression',
    expression: true,
    params: [param],
    body: exp
  }
}
