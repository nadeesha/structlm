export type Infer<T> = T extends Schema<infer U> ? U : never;

export type ValidationFunction<T> = (value: T) => boolean;

export abstract class Schema<T = unknown> {
  public validationFn?: ValidationFunction<T>;
  public isOptional: boolean = false;

  abstract stringify(): string;
  abstract parse(jsonString: string): T;

  validate(fn: ValidationFunction<T>): this {
    this.validationFn = fn;
    return this;
  }

  optional(): this {
    this.isOptional = true;
    return this;
  }

  public runValidation(value: T): boolean {
    return this.validationFn ? this.validationFn(value) : true;
  }

  protected buildStringifyResult(baseType: string): string {
    const hints: string[] = [];

    if (this.validationFn) {
      hints.push(this.validationFn.toString());
    }

    if (this.isOptional) {
      hints.push('optional');
    }

    if (hints.length > 0) {
      return `${baseType} /* ${hints.join(', ')} */`;
    }

    return baseType;
  }

  protected parseJson(jsonString: string): unknown {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(
        `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
