import * as assert from 'power-assert'
import * as ts from 'typescript'
import { compile } from 'vue-template-compiler'
import { modifyVueSource } from '../src/modify'
import { Checker } from '../src/diagnostic'

describe('Diagnostic', () => {
  const fixtureName = './test/fixtures/test.ts'

  const program = ts.createProgram([fixtureName], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.ES2015,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    experimentalDecorators: true
  })
  const checker = new Checker(program, program.getTypeChecker())

  it('should return diagnostic array', () => {
    const { ast } = compile('<div>{{ msg }}</div>')
    const source = program.getSourceFile(fixtureName)
    assert.deepStrictEqual(checker.getDiagnostics(ast, source), [])
  })
})
