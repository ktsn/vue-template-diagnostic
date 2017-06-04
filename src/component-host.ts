import * as ts from 'typescript'
import { SimpleSymbolTable, SymbolTable } from './symbol'
import { TypeScriptContext, TypeScriptSymbol } from './typescript'

export interface ComponentHost {
  members: SymbolTable
}

export function createComponentHost(
  source: ts.SourceFile,
  context: TypeScriptContext
): ComponentHost | undefined {
  const node = getExportedExpression(source)
  if (!node) return

  const type = context.checker.getTypeAtLocation(node)
  const component = getInstanceType(type)
  if (!component) return

  const members = component.getProperties()
    .map(p => {
      return new TypeScriptSymbol(p, node, context)
    })

  return {
    members: new SimpleSymbolTable(members)
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
