import { Type, anyType } from './type'

export interface Symbol {
  name: string
  type: Type
}

export interface SymbolTable {
  getByName(name: string): Symbol | undefined
  concat(table: SymbolTable): SymbolTable
}

export class AnySymbolTable implements SymbolTable {
  getByName(name: string): Symbol {
    return {
      name,
      type: anyType
    }
  }

  concat(table: SymbolTable): SymbolTable {
    return this
  }
}

export class SimpleSymbolTable {
  private table = new Map<string, Symbol>()

  constructor(symbols: Symbol[]) {
    symbols.forEach(s => {
      this.table.set(s.name, s)
    })
  }

  getByName(name: string): Symbol | undefined {
    return this.table.get(name)
  }

  concat(table: SimpleSymbolTable | AnySymbolTable): SymbolTable {
    if (table instanceof AnySymbolTable) return table
    const symbols: Symbol[] = []
    this.forEach(value => symbols.push(value))
    table.forEach(value => symbols.push(value))
    return new SimpleSymbolTable(symbols)
  }

  forEach(fn: (symbol: Symbol, name: string) => void): void {
    return this.table.forEach(fn)
  }
}
