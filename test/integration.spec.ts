import * as assert from 'power-assert'
import * as ts from 'typescript'

import {
  createComponentHost,
  parseExpression,
  checkTemplate,
  createTypeRepository
} from '../src/index'

describe('Integration test', () => {
  const program = ts.createProgram(['test/fixtures/test.ts'], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ES2015,
    moduleResolution: ts.ModuleResolutionKind.NodeJs
  })

  const checker = program.getTypeChecker()

  const context = { ts, program, checker }

  it('should report the result of the diagnostic', () => {
    const source = program.getSourceFile('test/fixtures/test.ts')

    const host = createComponentHost(source, context)

    if (host) {
      const repository = createTypeRepository(context)

      const exp = parseExpression('123 - msg + ", Vue.js!" + foo')

      if (!exp.failed) {
        const diagnostics = checkTemplate(exp.value, host.members, repository)

        assert.deepStrictEqual(diagnostics, [
          {
            message: `The right-hand side of a binary operator '-' must be of type 'number' or 'any'`,
            start: 6,
            end: 9
          },
          {
            message: `'foo' is not defined`,
            start: 26,
            end: 29
          }
        ])
        return
      }
    }
    assert(false)
  })
})
