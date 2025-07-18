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

// Type helper to infer the output type from a schema shape
type InferObjectType<T extends Record<string, Schema<any>>> = {
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
};

export const string = () => new StringSchema();
export const number = () => new NumberSchema();
export const boolean = () => new BooleanSchema();
export const array = <T>(itemSchema: Schema<T>) => new ArraySchema<T>(itemSchema);
export const object = <T extends Record<string, Schema<any>>>(shape: T) => 
  new ObjectSchema<InferObjectType<T>>(shape as { [K in keyof InferObjectType<T>]: Schema<InferObjectType<T>[K]> });