import { Schema } from './types';

export class StringSchema extends Schema<string> {
  toString(): string {
    const baseType = 'string';
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }
}

export class NumberSchema extends Schema<number> {
  toString(): string {
    const baseType = 'number';
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }
}

export class BooleanSchema extends Schema<boolean> {
  toString(): string {
    const baseType = 'boolean';
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }
}

export class ArraySchema<T> extends Schema<T[]> {
  constructor(private itemSchema: Schema<T>) {
    super();
  }
  
  toString(): string {
    const baseType = `[${this.itemSchema.toString()}]`;
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
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
    const baseType = `{ ${entries.join(', ')} }`;
    
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
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