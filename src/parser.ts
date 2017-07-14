import { Expression } from 'estree'
import { parse as parseJs } from 'espree'
import { parse, VElement } from 'vue-eslint-parser'
import { Type } from './type'
import { Failable, fail, success } from './utils'

const parserOptions = {
  range: true,
  ecmaVersion: 8
}

export function parseTemplate(code: string): VElement | null {
  const wrapped = code
    .replace(/(^\s*) {10}/, '$1<template>')
    .replace(/ {11}(\s*$)/, '</template>$1')
  return parse(wrapped, parserOptions).templateBody
}

export function parseExpression(expression: string): Failable<string, Expression> {
  let program
  try {
    program = parseJs(expression, parserOptions)
  } catch (err) {
    return fail(err.message)
  }

  if (program.body.length >= 2) {
    return fail('Template expression should have only one expression')
  }

  const statement = program.body[0]
  if (statement.type !== 'ExpressionStatement') {
    return fail('Template expression must be an expression')
  }

  return success(statement.expression)
}
