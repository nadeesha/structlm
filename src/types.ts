export type Infer<T> = T extends Schema<infer U> ? U : never;

export type ValidationFunction<T> = (value: T) => boolean;

export abstract class Schema<T = unknown> {
  public validationFn?: ValidationFunction<T>;

  abstract toString(): string;

  validate(fn: ValidationFunction<T>): this {
    this.validationFn = fn;
    return this;
  }

  public runValidation(value: T): boolean {
    return this.validationFn ? this.validationFn(value) : true;
  }
}
