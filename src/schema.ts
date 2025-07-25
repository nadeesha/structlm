import { Schema } from './types';

export class StringSchema extends Schema<string> {
  stringify(): string {
    const baseType = 'string';
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }

  parse(jsonString: string): string {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (typeof parsed !== 'string') {
      throw new Error(`Expected string, got ${typeof parsed}`);
    }
    
    if (!this.runValidation(parsed)) {
      throw new Error(`Validation failed for value: ${JSON.stringify(parsed)}`);
    }
    
    return parsed;
  }
}

export class NumberSchema extends Schema<number> {
  stringify(): string {
    const baseType = 'number';
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }

  parse(jsonString: string): number {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (typeof parsed !== 'number') {
      throw new Error(`Expected number, got ${typeof parsed}`);
    }
    
    if (!this.runValidation(parsed)) {
      throw new Error(`Validation failed for value: ${JSON.stringify(parsed)}`);
    }
    
    return parsed;
  }
}

export class BooleanSchema extends Schema<boolean> {
  stringify(): string {
    const baseType = 'boolean';
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }

  parse(jsonString: string): boolean {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (typeof parsed !== 'boolean') {
      throw new Error(`Expected boolean, got ${typeof parsed}`);
    }
    
    if (!this.runValidation(parsed)) {
      throw new Error(`Validation failed for value: ${JSON.stringify(parsed)}`);
    }
    
    return parsed;
  }
}

export class ArraySchema<T> extends Schema<T[]> {
  constructor(private itemSchema: Schema<T>) {
    super();
  }
  
  stringify(): string {
    const baseType = `[${this.itemSchema.stringify()}]`;
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }

  parse(jsonString: string): T[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected array, got ${typeof parsed}`);
    }
    
    const result: T[] = [];
    for (let i = 0; i < parsed.length; i++) {
      try {
        const itemJsonString = JSON.stringify(parsed[i]);
        const parsedItem = this.itemSchema.parse(itemJsonString);
        result.push(parsedItem);
      } catch (error) {
        throw new Error(`Array item at index ${i}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (!this.runValidation(result)) {
      throw new Error(`Array validation failed for value: ${JSON.stringify(result)}`);
    }
    
    return result;
  }
}

export class ObjectSchema<T extends Record<string, any>> extends Schema<T> {
  constructor(private shape: { [K in keyof T]: Schema<T[K]> }) {
    super();
  }
  
  stringify(): string {
    const entries = Object.entries(this.shape).map(([key, schema]) => {
      return `${key}: ${(schema as Schema).stringify()}`;
    });
    const baseType = `{ ${entries.join(', ')} }`;
    
    if (this.validationFn) {
      const fnString = this.validationFn.toString();
      return `${baseType} /* ${fnString} */`;
    }
    return baseType;
  }

  parse(jsonString: string): T {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error(`Expected object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`);
    }
    
    const result: any = {};
    const parsedObj = parsed as Record<string, unknown>;
    
    for (const [key, schema] of Object.entries(this.shape)) {
      if (!(key in parsedObj)) {
        throw new Error(`Missing required property: ${key}`);
      }
      
      try {
        const propertyJsonString = JSON.stringify(parsedObj[key]);
        result[key] = (schema as Schema).parse(propertyJsonString);
      } catch (error) {
        throw new Error(`Property '${key}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (!this.runValidation(result as T)) {
      throw new Error(`Object validation failed for value: ${JSON.stringify(result)}`);
    }
    
    return result as T;
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