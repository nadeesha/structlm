import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index';

describe('Basic Types', () => {
  describe('s.string()', () => {
    test('should create a string schema', () => {
      const schema = s.string();
      assert.strictEqual(schema.stringify(), 'string');
    });

    test('should support validation', () => {
      const emailSchema = s.string().validate(email => email.includes('@'));
      assert.strictEqual(
        emailSchema.stringify(),
        'string /* email=>email.includes("@") */'
      );
      assert.strictEqual(typeof emailSchema.validationFn, 'function');
    });

    test('should validate correctly', () => {
      const emailSchema = s.string().validate(email => email.includes('@'));
      assert.strictEqual(emailSchema.runValidation('test@example.com'), true);
      assert.strictEqual(emailSchema.runValidation('invalid-email'), false);
    });
  });

  describe('s.number()', () => {
    test('should create a number schema', () => {
      const schema = s.number();
      assert.strictEqual(schema.stringify(), 'number');
    });

    test('should support validation', () => {
      const positiveSchema = s.number().validate(n => n > 0);
      assert.strictEqual(positiveSchema.stringify(), 'number /* n=>n>0 */');
      assert.strictEqual(typeof positiveSchema.validationFn, 'function');
    });

    test('should validate correctly', () => {
      const positiveSchema = s.number().validate(n => n > 0);
      assert.strictEqual(positiveSchema.runValidation(5), true);
      assert.strictEqual(positiveSchema.runValidation(-1), false);
    });
  });

  describe('s.boolean()', () => {
    test('should create a boolean schema', () => {
      const schema = s.boolean();
      assert.strictEqual(schema.stringify(), 'boolean');
    });

    test('should support validation', () => {
      const trueOnlySchema = s.boolean().validate(b => b === true);
      assert.strictEqual(
        trueOnlySchema.stringify(),
        'boolean /* b=>b===true */'
      );
      assert.strictEqual(typeof trueOnlySchema.validationFn, 'function');
    });

    test('should validate correctly', () => {
      const trueOnlySchema = s.boolean().validate(b => b === true);
      assert.strictEqual(trueOnlySchema.runValidation(true), true);
      assert.strictEqual(trueOnlySchema.runValidation(false), false);
    });
  });
});
