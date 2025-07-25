import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index';

describe('Validation', () => {
  describe('Basic validation', () => {
    test('should validate strings with custom functions', () => {
      const emailSchema = s.string().validate(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      });

      assert.strictEqual(emailSchema.runValidation('test@example.com'), true);
      assert.strictEqual(emailSchema.runValidation('invalid-email'), false);
      assert.strictEqual(emailSchema.runValidation('user@domain.co.uk'), true);
    });

    test('should validate numbers with custom functions', () => {
      const positiveSchema = s.number().validate(n => n > 0);
      const rangeSchema = s.number().validate(n => n >= 0 && n <= 100);

      assert.strictEqual(positiveSchema.runValidation(5), true);
      assert.strictEqual(positiveSchema.runValidation(-1), false);
      assert.strictEqual(positiveSchema.runValidation(0), false);

      assert.strictEqual(rangeSchema.runValidation(50), true);
      assert.strictEqual(rangeSchema.runValidation(-1), false);
      assert.strictEqual(rangeSchema.runValidation(101), false);
    });

    test('should validate booleans with custom functions', () => {
      const trueOnlySchema = s.boolean().validate(b => b === true);
      const falseOnlySchema = s.boolean().validate(b => b === false);

      assert.strictEqual(trueOnlySchema.runValidation(true), true);
      assert.strictEqual(trueOnlySchema.runValidation(false), false);

      assert.strictEqual(falseOnlySchema.runValidation(false), true);
      assert.strictEqual(falseOnlySchema.runValidation(true), false);
    });
  });

  describe('Complex validation', () => {
    test('should validate arrays with custom functions', () => {
      const nonEmptyArraySchema = s
        .array(s.string())
        .validate(arr => arr.length > 0);
      const maxLengthSchema = s
        .array(s.number())
        .validate(arr => arr.length <= 3);

      assert.strictEqual(nonEmptyArraySchema.runValidation(['test']), true);
      assert.strictEqual(nonEmptyArraySchema.runValidation([]), false);

      assert.strictEqual(maxLengthSchema.runValidation([1, 2, 3]), true);
      assert.strictEqual(maxLengthSchema.runValidation([1, 2, 3, 4]), false);
    });

    test('should validate objects with custom functions', () => {
      const userSchema = s
        .object({
          name: s.string(),
          age: s.number(),
        })
        .validate(user => user.name.length > 0 && user.age >= 0);

      assert.strictEqual(
        userSchema.runValidation({ name: 'John', age: 25 }),
        true
      );
      assert.strictEqual(
        userSchema.runValidation({ name: '', age: 25 }),
        false
      );
      assert.strictEqual(
        userSchema.runValidation({ name: 'John', age: -1 }),
        false
      );
    });
  });

  describe('Real-world validation examples', () => {
    test('should validate email addresses', () => {
      const emailSchema = s.string().validate(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      });

      assert.strictEqual(emailSchema.runValidation('user@example.com'), true);
      assert.strictEqual(
        emailSchema.runValidation('test.email@domain.co.uk'),
        true
      );
      assert.strictEqual(emailSchema.runValidation('invalid-email'), false);
      assert.strictEqual(emailSchema.runValidation('user@'), false);
      assert.strictEqual(emailSchema.runValidation('@domain.com'), false);
    });

    test('should validate usernames', () => {
      const usernameSchema = s.string().validate(username => {
        return (
          username.length >= 3 &&
          username.length <= 20 &&
          /^[a-zA-Z0-9_]+$/.test(username)
        );
      });

      assert.strictEqual(usernameSchema.runValidation('user123'), true);
      assert.strictEqual(usernameSchema.runValidation('valid_username'), true);
      assert.strictEqual(usernameSchema.runValidation('ab'), false); // too short
      assert.strictEqual(
        usernameSchema.runValidation(
          'this_is_a_very_long_username_that_exceeds_limit'
        ),
        false
      ); // too long
      assert.strictEqual(
        usernameSchema.runValidation('invalid-username'),
        false
      ); // contains hyphen
    });

    test('should validate age ranges', () => {
      const adultAgeSchema = s
        .number()
        .validate(age => age >= 18 && age <= 120);

      assert.strictEqual(adultAgeSchema.runValidation(25), true);
      assert.strictEqual(adultAgeSchema.runValidation(18), true);
      assert.strictEqual(adultAgeSchema.runValidation(120), true);
      assert.strictEqual(adultAgeSchema.runValidation(17), false);
      assert.strictEqual(adultAgeSchema.runValidation(121), false);
    });

    test('should validate enum-like values', () => {
      const statusSchema = s
        .string()
        .validate(status => ['active', 'inactive', 'pending'].includes(status));

      assert.strictEqual(statusSchema.runValidation('active'), true);
      assert.strictEqual(statusSchema.runValidation('inactive'), true);
      assert.strictEqual(statusSchema.runValidation('pending'), true);
      assert.strictEqual(statusSchema.runValidation('invalid'), false);
    });
  });

  describe('No validation', () => {
    test('should return true when no validation function is provided', () => {
      const stringSchema = s.string();
      const numberSchema = s.number();
      const booleanSchema = s.boolean();

      assert.strictEqual(stringSchema.runValidation('any string'), true);
      assert.strictEqual(numberSchema.runValidation(42), true);
      assert.strictEqual(booleanSchema.runValidation(true), true);
    });
  });
});
