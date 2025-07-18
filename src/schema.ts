import { Schema } from './types';

export class StringSchema extends Schema<string> {
  toString(): string {
    return 'string';
  }
}

export class NumberSchema extends Schema<number> {
  toString(): string {
    return 'number';
  }
}

export class BooleanSchema extends Schema<boolean> {
  toString(): string {
    return 'boolean';
  }
}

export class ArraySchema<T> extends Schema<T[]> {
  constructor(private itemSchema: Schema<T>) {
    super();
  }
  
  toString(): string {
    return `[${this.itemSchema.toString()}]`;
  }
}

export class ObjectSchema<T extends Record<string, any>> extends Schema<T> {
  constructor(private shape: { [K in keyof T]: Schema<T[K]> }) {
    super();
  }
  
  toString(): string {
    const entries = Object.entries(this.shape).map(([key, schema]) => {
      return `${key}: ${(schema as Schema).toString()}`;
    });
    return `{ ${entries.join(', ')} }`;
  }
}

export const string = () => new StringSchema();
export const number = () => new NumberSchema();
export const boolean = () => new BooleanSchema();
export const array = <T>(itemSchema: Schema<T>) => new ArraySchema(itemSchema);
export const object = <T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }) => new ObjectSchema(shape);