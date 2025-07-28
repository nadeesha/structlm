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
}
