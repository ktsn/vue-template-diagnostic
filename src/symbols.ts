import { Type } from './types'

export interface Symbol {
  name: string
  type: Type
}

export class SymbolTable {
  private table = new Map<string, Symbol>()

  constructor(symbols: Symbol[]) {
    symbols.forEach(s => {
      this.table.set(s.name, s)
    })
  }

  getByName(name: string): Symbol | undefined {
    return this.table.get(name)
  }

  concat(table: SymbolTable): SymbolTable {
    const symbols: Symbol[] = []
    this.forEach(value => symbols.push(value))
    table.forEach(value => symbols.push(value))
    return new SymbolTable(symbols)
  }

  forEach(fn: (symbol: Symbol, name: string) => void): void {
    return this.table.forEach(fn)
  }
}
