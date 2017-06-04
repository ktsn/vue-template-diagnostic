# vue-template-diagnostic

## Example

```ts
import {
  createComponentHost,
  createTypeRepository,
  parseExpression,
  checkExpression
} from 'vue-template-diagnostic'

// Create TypeScript context
const checker = program.getTypeChecker()
const context = { ts, program, checker }

// Create a type repository
const repository = createTypeRepository(context)

// Get a TypeScript source file of a Vue.js component somehow
const source = program.getSourceFile('/path/to/component.ts')

// Create a component host
const host = createComponentHost(source, context)
if (host) {
  // Parse an expression in a Vue.js template
  const exp = parseExpression('"Hello, " + msg')

  if (!exp.failed) {
    // Check the parsed expression.
    // Must be provided a variables scope (you can use `host.members`)
    // and type repository
    const diagnostics = checkExpression(exp.value, host.members, repository)

    console.log(diagnostics)
  }
}
```

## License

MIT
