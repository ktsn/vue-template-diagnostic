import * as ESTree from 'estree'
import { SymbolTable } from './symbols'
import { Diagnostic } from './diagnostic'

import { Type, TypeKind, BuiltIn, isAny, isNumber, isString, isSymbol, isFunction, isObject } from './types'

export function checkExpression(expression: ESTree.Expression, scope: SymbolTable): Diagnostic[] {
  const checker = new ExpressionChecker(scope)
  return checker.check(expression)
}

class ExpressionChecker {
  private diagnostics: Diagnostic[]

  constructor(private scope: SymbolTable) {}

  check(expression: ESTree.Expression): Diagnostic[] {
    this.diagnostics = []
    this.typeOf(expression)
    return this.diagnostics
  }

  private typeOf(node: ESTree.Node): Type {
    switch (node.type) {
      case 'CallExpression':
        return this.typeOfCallExpression(node)
      case 'BinaryExpression':
        return this.typeOfBinaryExpression(node)
      case 'ObjectExpression':
        return this.typeOfObjectExpression(node)
      case 'Identifier':
        return this.typeOfIdentifier(node)
      case 'Literal':
        return this.typeOfLiteral(node)
      default:
        return BuiltIn.any
    }
  }

  private typeOfCallExpression(node: ESTree.CallExpression): Type {
    const callee = this.typeOf(node.callee)
    // TODO: Check argument types
    const args = node.arguments.map(arg => this.typeOf(arg))

    if (!isFunction(callee) && !isAny(callee)) {
      this.addDiagnostic(
        node,
        `Type '${callee.name}' has no compatible call signatures`
      )
    }

    // TODO: Return appropriate return type
    return BuiltIn.any
  }

  private typeOfBinaryExpression(node: ESTree.BinaryExpression): Type {
    const left = this.typeOf(node.left)
    const right = this.typeOf(node.right)

    if (isAny(left) || isAny(right)) {
      return BuiltIn.any
    }

    // https://github.com/Microsoft/TypeScript/blob/v2.3.4/doc/spec.md#4.19
    switch (node.operator) {
      case '<':
      case '>':
      case '<=':
      case '>=':
      case '==':
      case '!=':
      case '===':
      case '!==':
        if (left.kind !== right.kind) {
          this.addDiagnostic(
            node,
            `The binary operator '${node.operator}' cannot be applied to types '${left.name}' and '${right.name}'`
          )
        }
        return BuiltIn.boolean

      case '*':
      case '/':
      case '%':
      case '-':
      case '<<':
      case '>>':
      case '>>>':
      case '**':
      case '&':
      case '|':
      case '^':
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

        if (!isObject(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of a 'in' operator must be of type 'any' or 'object'`
          )
          return BuiltIn.any
        }

        return BuiltIn.boolean

      default:
        throw new Error(`Unknown binary operator '${node.operator}'`)
    }
  }

  private typeOfObjectExpression(node: ESTree.ObjectExpression): Type {
    return {
      name: 'Object',
      kind: TypeKind.Object
    }
  }

  private typeOfIdentifier(node: ESTree.Identifier): Type {
    const symbol = this.scope.getByName(node.name)
    if (!symbol) {
      this.addDiagnostic(node, `'${node.name}' is not defined`)
      return BuiltIn.any
    }
    return symbol.type
  }

  private typeOfLiteral(node: ESTree.Literal): Type {
    switch (typeof node.value) {
      case 'string':
        return BuiltIn.string
      case 'number':
        return BuiltIn.number
      case 'boolean':
        return BuiltIn.boolean
      case 'object':
        if (!node.value) {
          return BuiltIn.null
        } else {
          return {
            name: 'Object',
            kind: TypeKind.Object
          }
        }
      default:
        throw new Error(`Unknown literal '${node.value}'`)
    }
  }

  private addDiagnostic(node: ESTree.Node, message: string): void {
    this.diagnostics.push({
      message,
      start: node.range![0],
      end: node.range![1]
    })
  }
}
