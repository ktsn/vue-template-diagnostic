import * as ts from 'typescript'

export interface Diagnostic {
  message: string
  start: number
  end: number
}

export class Checker {
  constructor(
    private program: ts.Program,
    private checker: ts.TypeChecker
  ) {
  }

  getDiagnostics(ast: any /* ASTElement */, source: ts.SourceFile): Diagnostic[] {
    const options = getExportedExpression(source)
    if (!options) return []

    const type = this.checker.getTypeAtLocation(options)
    const component = getInstanceType(type)
    if (!component) return []

    const s = component.getProperty('msg')
    console.log(s)

    return []
  }
}

function getInstanceType(type: ts.Type): ts.Type | undefined {
  const signatures = type.getConstructSignatures()

  return signatures.reduce((acc: ts.Type | undefined, s) => {
    return acc || s.getReturnType()
  }, undefined)
}

function getExportedExpression(source: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  let res

  function findExport(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.ExportAssignment) {
      res = (node as ts.ExportAssignment).expression
    }
  }

  ts.forEachChild(source, findExport)

  return res
}
