declare module 'espree' {
  import { Program } from 'estree'
  export function parse(code: string, options: any): Program
}