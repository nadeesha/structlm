import { Schema } from './types';

export class StringSchema extends Schema<string> {
  stringify(): string {
    return this.buildStringifyResult('string');
  }

  parse(jsonString: string): string {
    const parsed = this.parseJson(jsonString);

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
    return this.buildStringifyResult('number');
  }

  parse(jsonString: string): number {
    const parsed = this.parseJson(jsonString);

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
    return this.buildStringifyResult('boolean');
  }

  parse(jsonString: string): boolean {
    const parsed = this.parseJson(jsonString);

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
    return this.buildStringifyResult(baseType);
  }

  parse(jsonString: string): T[] {
    const parsed = this.parseJson(jsonString);

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
        throw new Error(
          `Array item at index ${i}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (!this.runValidation(result)) {
      throw new Error(
        `Array validation failed for value: ${JSON.stringify(result)}`
      );
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
    return this.buildStringifyResult(baseType);
  }

  parse(jsonString: string): T {
    const parsed = this.parseJson(jsonString);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        `Expected object, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`
      );
    }

    const result: any = {};
    const parsedObj = parsed as Record<string, unknown>;

    for (const [key, schema] of Object.entries(this.shape)) {
      if (!(key in parsedObj)) {
        if ((schema as Schema).isOptional) {
          // Skip optional properties that are missing
          continue;
        }
        throw new Error(`Missing required property: ${key}`);
      }

      try {
        const propertyJsonString = JSON.stringify(parsedObj[key]);
        result[key] = (schema as Schema).parse(propertyJsonString);
      } catch (error) {
        throw new Error(
          `Property '${key}': ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (!this.runValidation(result as T)) {
      throw new Error(
        `Object validation failed for value: ${JSON.stringify(result)}`
      );
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
export const array = <T>(itemSchema: Schema<T>) =>
  new ArraySchema<T>(itemSchema);
export const object = <T extends Record<string, Schema<any>>>(shape: T) =>
  new ObjectSchema<InferObjectType<T>>(
    shape as { [K in keyof InferObjectType<T>]: Schema<InferObjectType<T>[K]> }
  );
