declare module 'vue-template-compiler' {
  interface CompilerOptions {
    warn?: Function // allow customizing warning in different environments; e.g. node
    expectHTML?: boolean // only false for non-web builds
    modules?: Array<ModuleOptions> // platform specific modules; e.g. style; class
    staticKeys?: string // a list of AST properties to be considered static; for optimization
    directives?: { [key: string]: Function } // platform specific directives
    isUnaryTag?: (tag: string) => boolean | undefined // check if a tag is unary for the platform
    canBeLeftOpenTag?: (tag: string) => boolean | undefined // check if a tag can be left opened
    isReservedTag?: (tag: string) => boolean | undefined // check if a tag is a native for the platform
    mustUseProp?: (tag: string, type: string | undefined, name: string) => boolean // check if an attribute should be bound as a property
    isPreTag?: (attr: string) => boolean | undefined // check if a tag needs to preserve whitespace
    getTagNamespace?: (tag: string) => string | undefined // check the namespace for a tag
    transforms?: Array<Function> // a list of transforms on parsed AST before codegen
    preserveWhitespace?: boolean
    isFromDOM?: boolean
    shouldDecodeTags?: boolean
    shouldDecodeNewlines?: boolean

    // runtime user-configurable
    delimiters?: [string, string] // template delimiters
  }

  interface CompiledResult {
    ast: ASTElement | undefined
    render: string
    staticRenderFns: Array<string>
    errors: Array<string>
    tips?: Array<string>
  }

  interface ModuleOptions {
    preTransformNode: (el: ASTElement) => void
    transformNode: (el: ASTElement) => void // transform an element's AST node
    postTransformNode: (el: ASTElement) => void
    genData: (el: ASTElement) => string // generate extra data string for an element
    transformCode?: (el: ASTElement, code: string) => string // further transform generated code for an element
    staticKeys?: Array<string> // AST properties to be considered static
  }

  interface ASTModifiers {
    [key: string]: boolean
  }

  type ASTIfConditions = Array<{ exp: string | undefined, block: ASTElement }>

  interface ASTElementHandler {
    value: string
    modifiers: ASTModifiers | undefined
  }

  interface ASTElementHandlers {
    [key: string]: ASTElementHandler | Array<ASTElementHandler>
  }

  interface ASTDirective {
    name: string
    rawName: string
    value: string
    arg: string | undefined
    modifiers: ASTModifiers | undefined
  }

  type ASTNode = ASTElement | ASTText | ASTExpression

  interface ASTElement {
    type: 1
    tag: string
    attrsList: Array<{ name: string, value: string }>
    attrsMap: { [key: string]: string | null }
    parent: ASTElement | void
    children: Array<ASTNode>

    static?: boolean
    staticRoot?: boolean
    staticInFor?: boolean
    staticProcessed?: boolean
    hasBindings?: boolean

    text?: string
    attrs?: Array<{ name: string, value: string }>
    props?: Array<{ name: string, value: string }>
    plain?: boolean
    pre?: true
    ns?: string

    component?: string
    inlineTemplate?: true
    transitionMode?: string | null
    slotName?: string
    slotTarget?: string
    slotScope?: string
    scopedSlots?: { [name: string]: ASTElement }

    ref?: string
    refInFor?: boolean

    if?: string
    ifProcessed?: boolean
    elseif?: string
    else?: true
    ifConditions?: ASTIfConditions

    for?: string
    forProcessed?: boolean
    key?: string
    alias?: string
    iterator1?: string
    iterator2?: string

    staticClass?: string
    classBinding?: string
    staticStyle?: string
    styleBinding?: string
    events?: ASTElementHandlers
    nativeEvents?: ASTElementHandlers

    transition?: string | true
    transitionOnAppear?: boolean

    model?: {
      value: string
      callback: string
      expression: string
    }

    directives?: Array<ASTDirective>

    forbidden?: true
    once?: true
    onceProcessed?: boolean
    wrapData?: (code: string) => string

    // weex specific
    appendAsTree?: boolean
  }

  interface ASTExpression {
    type: 2
    expression: string
    text: string
    static?: boolean
  }

  interface ASTText {
    type: 3
    text: string
    static?: boolean
  }

  interface SFCParserOptions {
    pad?: boolean
  }

  interface SFCBlock {
    type: string
    content: string
    start?: number
    end?: number
    lang?: string
    src?: string
    scoped?: boolean
    module?: string | boolean
  }

  interface SFCCustomBlock {
    type: string
    content: string
    start?: number
    end?: number
    src?: string
    attrs: {
      [key: string]: string
    }
  }

  interface SFCDescriptor {
    template: SFCBlock | null | undefined
    script: SFCBlock | null | undefined
    styles: SFCBlock[]
    customBlocks: SFCCustomBlock[]
  }

  interface TemplateCompiler {
    compile (template: string, options?: CompilerOptions): CompiledResult
    parseComponent (file: string, options?: SFCParserOptions): SFCDescriptor
  }

  const compiler: TemplateCompiler
  export = compiler
}
