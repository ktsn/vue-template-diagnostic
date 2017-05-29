import { Node, Expression, BinaryExpression } from 'estree'
import { SymbolTable } from './symbols'
import { Diagnostic } from './diagnostic'

import { Type, BuiltIn, isAny, isNumber, isString, isSymbol, isFunction, isObject } from './types'

export function checkExpression(expression: Expression, scope: SymbolTable): Diagnostic[] {
  const checker = new ExpressionChecker(scope)
  return checker.check(expression)
}

class ExpressionChecker {
  private diagnostics: Diagnostic[]

  constructor(private scope: SymbolTable) {}

  check(expression: Expression): Diagnostic[] {
    this.diagnostics = []
    this.typeOf(expression)
    return this.diagnostics
  }

  private typeOf(node: Node): Type {
    switch (node.type) {
      case 'BinaryExpression':
        return this.typeOfBinaryExpression(node)

      case 'Identifier':
        const symbol = this.scope.getByName(node.name)
        if (!symbol) {
          this.addDiagnostic(node, `'${node.name}' is not defined`)
          return BuiltIn.any
        }
        return symbol.type

      default:
        return BuiltIn.any
    }
  }

  private typeOfBinaryExpression(node: BinaryExpression): Type {
    const left = this.typeOf(node.left)
    const right = this.typeOf(node.right)

    if (isAny(left) || isAny(right)) {
      return BuiltIn.any
    }

    switch (node.operator) {
      case '==':
      case '!=':
      case '===':
      case '!==':
        return BuiltIn.boolean

      case '<':
      case '<=':
      case '>':
      case '>=':
      case '<<':
      case '>>':
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
      case '|':
      case '^':
      case '&':
        if (!isNumber(left)) {
          this.addDiagnostic(
            node.left,
            `The left-hand side of a binary operator '${node.operator}' must be of type 'number' or 'any'`
          )
          return BuiltIn.any
        }

        if (!isNumber(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of a binary operator '${node.operator}' must be of type 'number' or 'any'`
          )
          return BuiltIn.any
        }

        return BuiltIn.number

      case '+':
        if (isString(left) || isString(right)) {
          return BuiltIn.string
        }

        if (isNumber(left) && isNumber(right)) {
          return BuiltIn.number
        }

        this.addDiagnostic(
          node,
          `The binary operator '+' cannot be applied to type '${left.name}' and '${right.name}'`
        )
        return BuiltIn.any

      case 'instanceof':
        if (!isObject(left)) {
          this.addDiagnostic(
            node.left,
            `The left-hand side of 'instanceof' must be of type 'any' or 'object'`
          )
          return BuiltIn.any
        }

        if (!isFunction(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of 'instanceof' must be of type 'any' or 'Function'`
          )
          return BuiltIn.any
        }

        return BuiltIn.boolean

      case 'in':
        if (!isNumber(left) && !isString(left) && !isSymbol(left)) {
          this.addDiagnostic(
            node.left,
            `The left-hand side of a 'in' operator must be of type 'any', 'number', 'string' or 'symbol'`
          )
          return BuiltIn.any
        }

        if (isObject(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of a 'in' operator must be of type 'any' or 'object'`
          )
          return BuiltIn.any
        }

        return BuiltIn.boolean

      default:
        this.addDiagnostic(
          node,
          `Unknown binary operator '${node.operator}' is found`
        )
        return BuiltIn.any
    }
  }

  private addDiagnostic(node: Node, message: string): void {
    this.diagnostics.push({
      message,
      start: node.range![0],
      end: node.range![1]
    })
  }
}
