declare module 'vue-eslint-parser' {
  import * as ESTree from 'estree'

  type Node = VNode | ESTree.Node

  type VNode = VIdentifier | VText | VExpressionContainer | VForExpression
    | VDirectiveKey | VAttributeValue | VAttribute | VStartTag | VEndTag | VElement

  export interface BaseNode extends ESTree.BaseNode {
    range: [number, number]
  }

  export interface VIdentifier extends BaseNode {
    type: 'VIdentifier'
    name: string
  }

  export interface VText extends BaseNode {
    type: 'VText'
    value: string
  }

  export interface VExpressionContainer extends BaseNode {
    type: 'VExpressionContainer'
    expression: ESTree.Expression | VForExpression | null
    syntaxError: Error | null
    references: Reference[]
  }

  export interface Reference {
    id: ESTree.Identifier
    mode: 'rw' | 'r' | 'w'
  }

  export interface VForExpression extends ESTree.BaseExpression {
    type: 'VForExpression'
    left: ESTree.Pattern[]
    right: ESTree.Expression
  }

  export interface VDirectiveKey extends BaseNode {
    type: 'VDirectiveKey'
    name: string
    argument: string | null
    modifiers: string[]
    shorthand: boolean
  }

  export interface VAttributeValue extends BaseNode {
    type: 'VAttributeValue'
    value: string
    raw: string
  }

  export type VAttribute = VDirectiveAttribute | VNormalAttribute

  export interface VDirectiveAttribute extends BaseNode {
    type: 'VAttribute'
    directive: true
    key: VDirectiveKey
    value: VExpressionContainer | null
  }

  export interface VNormalAttribute extends BaseNode {
    type: 'VAttribute'
    directive: false
    key: VIdentifier
    value: VAttributeValue | null
  }

  export interface VStartTag extends BaseNode {
    type: 'VStartTag'
    id: VIdentifier
    attributes: VAttribute[]
    selfClosing: boolean
  }

  export interface VEndTag extends BaseNode {
    type: 'VEndTag'
    id: VIdentifier
  }

  export interface VElement extends BaseNode {
    type: 'VElement'
    startTag: VStartTag
    children: (VText | VExpressionContainer | VElement)[]
    endTag: VEndTag | null
    variables: Variable[]
  }

  export interface Variable {
    id: ESTree.Identifier
    kind: 'v-for' | 'scope'
  }

  export interface Program extends ESTree.Program {
    templateBody: VElement | null
  }

  export function parse(code: string, options: any): Program
  export function parseForESLint(code: string, options: any): any
}