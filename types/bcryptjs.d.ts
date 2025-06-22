declare module 'bcryptjs' {
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function getRounds(hash: string): number;
  export function hashSync(data: string | Buffer, saltOrRounds: string | number): string;
  export function compareSync(data: string | Buffer, encrypted: string): boolean;
  export function genSaltSync(rounds?: number): string;
  
  // Add default export for compatibility
  const bcrypt: {
    hash: typeof hash;
    compare: typeof compare;
    genSalt: typeof genSalt;
    getRounds: typeof getRounds;
    hashSync: typeof hashSync;
    compareSync: typeof compareSync;
    genSaltSync: typeof genSaltSync;
  };
  
  export default bcrypt;
} 