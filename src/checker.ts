import { Node, Expression } from 'estree'
import { traverse, Visitor } from 'estraverse'
import { SymbolTable } from './symbols'
import { Diagnostic } from './diagnostic'

export function checkExpression(expression: Expression, scope: SymbolTable): Diagnostic[] {
  const visitor = new ExpressionVisitor(scope)
  traverse(expression, visitor)
  return visitor.diagnostics
}


class ExpressionVisitor implements Visitor {
  diagnostics: Diagnostic[] = []

  constructor(private scope: SymbolTable) {}

  enter = (node: Node, parentNode: Node | null): void => {
    switch (node.type) {
      case 'Identifier':
        const symbol = this.scope.getByName(node.name)
        if (!symbol) {
          this.addDiagnostic(node, `${node.name} is not defined`)
        }
      default:
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
