import * as assert from 'power-assert'
import { parseTemplate } from '../src/parser'
import { checkTemplate } from '../src/checker'
import { SimpleSymbolTable, Symbol } from '../src/symbol'
import { Diagnostic } from '../src/diagnostic'
import { TypeKind } from '../src/type'
import { number, string, boolean, func, obj, typeRepository } from './stubs/type-repository'

// The expressions that wrapped by these characters
// are expected to be reported an error
const OPEN = '«'
const CLOSE = '»'

describe('Checker for template', () => {
  it('should pass valid template', () => {
    test(`<div>{{ 123 + 'abc' }}</div>`)
  })

  it('should report when the template has invalid expression', () => {
    test(`<div>{{ «true» - 1 }}</div>`)
  })

  it('should handle multi-line template', () => {
    test(`<div>\n  <p>{{ «foo» }}</p>\n</div>`)
  })

  it('should report an error in shorthand v-bind expressions', () => {
    test(`<div :foo="«true» | 42"></div>`)
  })

  it('should report an error in vue directive expressions', () => {
    test(`<div v-if="«foo»"></div>`)
  })

  it('should handle multiple errors', () => {
    test(`<div><p>{{ «foo» }}</p>{{ «bar» }}</div>`)
  })

  it('should pass v-for expression', () => {
    test(`<div><div :test="item" v-for="item in list"></div></div>`, [
      {
        name: 'list',
        type: typeRepository.getTypeByKind(TypeKind.Any)
      }
    ])
  })

  it('should report an error of a v-for expression', () => {
    test(`<div><div v-for="text of «list»">{{ text }}</div></div>`)
  })
})

function test(code: string, scope: Symbol[] = []) {
  const prefix = '\n          \n'
  const suffix = '\n           \n'
  const composed = prefix + code + suffix

  const expect = extractExpectations(composed)

  const parsed = parseTemplate(expect.code)!
  assert(parsed !== null, 'Failed to parse: ' + expect.code)

  const res = checkTemplate(parsed, new SimpleSymbolTable(scope), typeRepository)
  verify(res, expect.expectations)
}

function extractExpectations(code: string) {
  let i = 0
  const expectations = []

  let cur
  while (cur = code[i]) {
    if (cur !== OPEN) {
      i += 1
      continue
    }

    const e = {
      start: i,
      end: null as any as number
    }
    expectations.push(e)

    code = code.slice(0, i) + code.slice(i + 1)

    while (cur = code[i]) {
      assert(cur !== OPEN)

      if (cur !== CLOSE) {
        i += 1
        continue
      }

      e.end = i
      code = code.slice(0, i) + code.slice(i + 1)
      break
    }

    assert(e.end)
  }

  return { code, expectations }
}

function verify(_diagnostics: Diagnostic[], _expectations: { start: number, end: number }[]): void {
  const diagnostics = _diagnostics.slice(0)
  const expectations = _expectations.slice(0)

  for (let i = 0; i < expectations.length; i++) {
    const expect = expectations[i]
    for (const actual of diagnostics) {
      if (actual.start === expect.start && actual.end === expect.end) {
        diagnostics.splice(diagnostics.indexOf(actual), 1)
        expectations.splice(expectations.indexOf(expect), 1)
        i -= 1
        break
      }
    }
  }

  assert.deepStrictEqual(diagnostics, [], 'Unexpected diagnostics are found')
  assert.deepStrictEqual(expectations, [], 'Expected diagnostics are not found')
}
