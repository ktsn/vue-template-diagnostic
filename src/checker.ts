import * as ESTree from 'estree'
import { SymbolTable } from './symbol'
import { Diagnostic } from './diagnostic'

import { Type, TypeKind, TypeRepository, unionType, isAny, isNumber, isString, isSymbol, isFunction, isObject } from './type'

export function checkExpression(
  expression: ESTree.Expression,
  scope: SymbolTable,
  repository: TypeRepository
): Diagnostic[] {
  const checker = new ExpressionChecker(scope, repository)
  return checker.check(expression)
}

class ExpressionChecker {
  private diagnostics: Diagnostic[]

  constructor(private scope: SymbolTable, private repository: TypeRepository) {}

  check(expression: ESTree.Expression): Diagnostic[] {
    this.diagnostics = []
    this.typeOf(expression)
    return this.diagnostics
  }

  private typeOf(node: ESTree.Node): Type {
    switch (node.type) {
      case 'CallExpression':
        return this.typeOfCallExpression(node)
      case 'UnaryExpression':
        return this.typeOfUnaryExpression(node)
      case 'UpdateExpression':
        return this.typeOfUpdateExpression(node)
      case 'BinaryExpression':
        return this.typeOfBinaryExpression(node)
      case 'LogicalExpression':
        return this.typeOfLogicalExpression(node)
      case 'ObjectExpression':
        return this.typeOfObjectExpression(node)
      case 'MemberExpression':
        return this.typeOfMemberExpression(node)
      case 'ConditionalExpression':
        return this.typeOfConditionalExpression(node)
      case 'Identifier':
        return this.typeOfIdentifier(node)
      case 'Literal':
        return this.typeOfLiteral(node)
      case 'TemplateLiteral':
        return this.typeOfTemplateLiteral(node)
      default:
        return this.getType(TypeKind.Any)
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
    return this.getType(TypeKind.Any)
  }

  private typeOfUnaryExpression(node: ESTree.UnaryExpression): Type {
    // https://github.com/Microsoft/TypeScript/blob/v2.3.4/doc/spec.md#4.18
    switch (node.operator) {
      case '-':
      case '+':
      case '~':
        return this.getType(TypeKind.Number)
      case '!':
      case 'delete':
        return this.getType(TypeKind.Boolean)
      case 'void':
        return this.getType(TypeKind.Undefined)
      case 'typeof':
        return this.getType(TypeKind.String)
      default:
        throw new Error(`Unknown unary operator '${node.operator}'`)
    }
  }

  private typeOfUpdateExpression(node: ESTree.UpdateExpression): Type {
    const type = this.typeOf(node.argument)

    if (!isNumber(type) && !isAny(type)) {
      this.addDiagnostic(
        node,
        `The operand of the '${node.operator}' must be of type 'any' or 'number'`
      )
    }

    return this.getType(TypeKind.Number)
  }

  private typeOfBinaryExpression(node: ESTree.BinaryExpression): Type {
    const left = this.typeOf(node.left)
    const right = this.typeOf(node.right)

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
        if (
          left.kind !== right.kind
          && !isAny(left) && !isAny(right)
        ) {
          this.addDiagnostic(
            node,
            `The binary operator '${node.operator}' cannot be applied to types '${left.name}' and '${right.name}'`
          )
        }
        return this.getType(TypeKind.Boolean)

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
        if (!isNumber(left) && !isAny(left)) {
          this.addDiagnostic(
            node.left,
            `The left-hand side of a binary operator '${node.operator}' must be of type 'number' or 'any'`
          )
          return this.getType(TypeKind.Any)
        }

        if (!isNumber(right) && !isAny(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of a binary operator '${node.operator}' must be of type 'number' or 'any'`
          )
          return this.getType(TypeKind.Any)
        }

        return this.getType(TypeKind.Number)

      case '+':
        if (isString(left) || isString(right)) {
          return this.getType(TypeKind.String)
        }

        if (isNumber(left) && isNumber(right)) {
          return this.getType(TypeKind.Number)
        }

        if (isAny(left) || isAny(right)) {
          return this.getType(TypeKind.Any)
        }

        this.addDiagnostic(
          node,
          `The binary operator '+' cannot be applied to type '${left.name}' and '${right.name}'`
        )
        return this.getType(TypeKind.Any)

      case 'instanceof':
        if (!isObject(left) && !isAny(left)) {
          this.addDiagnostic(
            node.left,
            `The left-hand side of 'instanceof' must be of type 'any' or 'object'`
          )
          return this.getType(TypeKind.Any)
        }

        if (!isFunction(right) && !isAny(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of 'instanceof' must be of type 'any' or 'Function'`
          )
          return this.getType(TypeKind.Any)
        }

        return this.getType(TypeKind.Boolean)

      case 'in':
        if (!isNumber(left) && !isString(left) && !isSymbol(left) && !isAny(left)) {
          this.addDiagnostic(
            node.left,
            `The left-hand side of a 'in' operator must be of type 'any', 'number', 'string' or 'symbol'`
          )
          return this.getType(TypeKind.Any)
        }

        if (!isObject(right) && !isAny(right)) {
          this.addDiagnostic(
            node.right,
            `The right-hand side of a 'in' operator must be of type 'any' or 'object'`
          )
          return this.getType(TypeKind.Any)
        }

        return this.getType(TypeKind.Boolean)

      default:
        throw new Error(`Unknown binary operator '${node.operator}'`)
    }
  }

  private typeOfLogicalExpression(node: ESTree.LogicalExpression): Type {
    const left = this.typeOf(node.left)
    const right = this.typeOf(node.right)

    switch (node.operator) {
      case '&&':
        return right
      case '||':
        return unionType(left, right)
      default:
        throw new Error(`Unknown logical operator '${node.operator}'`)
    }
  }

  private typeOfObjectExpression(node: ESTree.ObjectExpression): Type {
    return this.getType(TypeKind.Any)
  }

  private typeOfMemberExpression(node: ESTree.MemberExpression): Type {
    const parent = this.typeOf(node.object)
    const prop = node.property

    // TODO: supporting index signatures

    // Check the `foo.bar` syntax
    if (!node.computed && prop.type === 'Identifier') {
      const child = parent.members.getByName(prop.name)
      if (!child) {
        this.addDiagnostic(
          node,
          `Property '${prop.name}' does not exist on type '${parent.name}'`
        )
        return this.getType(TypeKind.Any)
      }
      return child.type
    }

    return this.getType(TypeKind.Any)
  }

  private typeOfConditionalExpression(node: ESTree.ConditionalExpression): Type {
    const consequent = this.typeOf(node.consequent)
    const alternate = this.typeOf(node.alternate)
    return unionType(consequent, alternate)
  }

  private typeOfIdentifier(node: ESTree.Identifier): Type {
    const symbol = this.scope.getByName(node.name)
    if (!symbol) {
      this.addDiagnostic(node, `'${node.name}' is not defined`)
      return this.getType(TypeKind.Any)
    }
    return symbol.type
  }

  private typeOfLiteral(node: ESTree.Literal): Type {
    switch (typeof node.value) {
      case 'string':
        return this.getType(TypeKind.String)
      case 'number':
        return this.getType(TypeKind.Number)
      case 'boolean':
        return this.getType(TypeKind.Boolean)
      case 'object':
        if (!node.value) {
          return this.getType(TypeKind.Null)
        } else {
          return this.getType(TypeKind.Any)
        }
      default:
        throw new Error(`Unknown literal '${node.value}'`)
    }
  }

  private typeOfTemplateLiteral(node: ESTree.TemplateLiteral): Type {
    // Touch all expressions to get diagnostics for them
    node.expressions.forEach(exp => this.typeOf(exp))
    return this.getType(TypeKind.String)
  }

  private addDiagnostic(node: ESTree.Node, message: string): void {
    this.diagnostics.push({
      message,
      start: node.range![0],
      end: node.range![1]
    })
  }

  private getType(kind: TypeKind): Type {
    return this.repository.getTypeByKind(kind)
  }
}
