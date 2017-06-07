import { Type, AnyType } from './type'

export interface Symbol {
  name: string
  type: Type
}

export interface SymbolTable {
  getByName(name: string): Symbol | undefined
  concat(symbols: Symbol[]): SymbolTable
}

export function createSymbol(name: string, type: Type): Symbol {
  return { name, type }
}

export class AnySymbolTable implements SymbolTable {
  constructor(private anyType: AnyType) {}

  getByName(name: string): Symbol {
    return {
      name,
      type: this.anyType
    }
  }

  concat(symbols: Symbol[]): SymbolTable {
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

  concat(symbols: Symbol[]): SymbolTable {
    const res = Array.from(this.table.values()).concat(symbols)
    return new SimpleSymbolTable(res)
  }

  forEach(fn: (symbol: Symbol, name: string) => void): void {
    return this.table.forEach(fn)
  }
}
