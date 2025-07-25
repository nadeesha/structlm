import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index.ts';

describe('Validation Hints in stringify()', () => {
  describe('Basic types with validation', () => {
    test('should include validation function for string schema', () => {
      const emailSchema = s.string().validate(value => value.includes('@'));
      assert.strictEqual(emailSchema.stringify(), 'string /* value => value.includes(\'@\') */');
    });

    test('should include validation function for number schema', () => {
      const positiveSchema = s.number().validate(value => value > 0);
      assert.strictEqual(positiveSchema.stringify(), 'number /* value => value > 0 */');
    });

    test('should include validation function for boolean schema', () => {
      const trueSchema = s.boolean().validate(value => value === true);
      assert.strictEqual(trueSchema.stringify(), 'boolean /* value => value === true */');
    });

    test('should include validation function for array schema', () => {
      const nonEmptyArray = s.array(s.string()).validate(arr => arr.length > 0);
      assert.strictEqual(nonEmptyArray.stringify(), '[string] /* arr => arr.length > 0 */');
    });

    test('should include validation function for object schema', () => {
      const userSchema = s.object({
        name: s.string(),
        age: s.number()
      }).validate(obj => obj.name.length > 0);
      
      assert.strictEqual(userSchema.stringify(), '{ name: string, age: number } /* obj => obj.name.length > 0 */');
    });
  });

  describe('Complex validation functions', () => {
    test('should stringify complex string validations', () => {
      const complexEmailSchema = s.string().validate(value => {
        return value.includes('@') && value.includes('.') && value.length > 5;
      });
      
      const result = complexEmailSchema.stringify();
      assert.ok(result.startsWith('string /* '));
      assert.ok(result.includes('value.includes(\'@\')'));
      assert.ok(result.includes('value.includes(\'.\')'));
      assert.ok(result.includes('value.length>5'));
      assert.ok(result.endsWith(' */'));
    });

    test('should stringify complex number validations', () => {
      const rangeSchema = s.number().validate(value => value >= 0 && value <= 100);
      
      const result = rangeSchema.stringify();
      assert.ok(result.startsWith('number /* '));
      assert.ok(result.includes('value>=0'));
      assert.ok(result.includes('value<=100'));
      assert.ok(result.endsWith(' */'));
    });

    test('should stringify complex array validations', () => {
      const complexArraySchema = s.array(s.string()).validate(arr => {
        return arr.length > 0 && arr.every(item => item.length > 0);
      });
      
      const result = complexArraySchema.stringify();
      assert.ok(result.startsWith('[string] /* '));
      assert.ok(result.includes('arr.length>0'));
      assert.ok(result.includes('arr.every'));
      assert.ok(result.endsWith(' */'));
    });

    test('should stringify regex validations', () => {
      const regexSchema = s.string().validate(value => /^[A-Z]/.test(value));
      
      const result = regexSchema.stringify();
      assert.ok(result.startsWith('string /* '));
      assert.ok(result.includes('/^[A-Z]/'));
      assert.ok(result.includes('.test(value)'));
      assert.ok(result.endsWith(' */'));
    });
  });

  describe('Nested structures with validation', () => {
    test('should include validation hints for nested object fields', () => {
      const userSchema = s.object({
        name: s.string().validate(value => value.length >= 2),
        email: s.string().validate(value => value.includes('@')),
        age: s.number().validate(value => value >= 18)
      });
      
      const result = userSchema.stringify();
      assert.ok(result.includes('name: string /* value=>value.length>=2 */'));
      assert.ok(result.includes('email: string /* value=>value.includes(\'@\') */'));
      assert.ok(result.includes('age: number /* value=>value>=18 */'));
    });

    test('should include validation hints for nested arrays', () => {
      const arraySchema = s.array(s.object({
        id: s.string().validate(value => value.startsWith('ID-')),
        count: s.number().validate(value => value > 0)
      })).validate(arr => arr.length > 0);
      
      const result = arraySchema.stringify();
      assert.ok(result.includes('id: string /* value=>value.startsWith(\'ID-\') */'));
      assert.ok(result.includes('count: number /* value=>value>0 */'));
      assert.ok(result.includes('}] /* arr=>arr.length>0 */'));
    });

    test('should handle deeply nested validation', () => {
      const deepSchema = s.object({
        user: s.object({
          profile: s.object({
            name: s.string().validate(value => value.length > 0),
            age: s.number().validate(value => value >= 0)
          }).validate(profile => profile.name !== 'admin')
        })
      });
      
      const result = deepSchema.stringify();
      assert.ok(result.includes('name: string /* value=>value.length>0 */'));
      assert.ok(result.includes('age: number /* value=>value>=0 */'));
      assert.ok(result.includes('} /* profile=>profile.name!=="admin" */'));
    });
  });

  describe('No validation function', () => {
    test('should not include validation hints when no validation function is provided', () => {
      assert.strictEqual(s.string().stringify(), 'string');
      assert.strictEqual(s.number().stringify(), 'number');
      assert.strictEqual(s.boolean().stringify(), 'boolean');
      assert.strictEqual(s.array(s.string()).stringify(), '[string]');
      assert.strictEqual(s.object({ name: s.string() }).stringify(), '{ name: string }');
    });
  });

  describe('Real-world examples', () => {
    test('should generate validation hints for user registration schema', () => {
      const userRegistrationSchema = s.object({
        username: s.string().validate(value => value.length >= 3 && value.length <= 20),
        email: s.string().validate(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
        password: s.string().validate(value => value.length >= 8),
        age: s.number().validate(value => value >= 13),
        termsAccepted: s.boolean().validate(value => value === true)
      });
      
      const result = userRegistrationSchema.stringify();
      
      // Check that validation hints are present
      assert.ok(result.includes('username: string /* '));
      assert.ok(result.includes('email: string /* '));
      assert.ok(result.includes('password: string /* '));
      assert.ok(result.includes('age: number /* '));
      assert.ok(result.includes('termsAccepted: boolean /* '));
      
      // Check specific validation logic
      assert.ok(result.includes('value.length>=3'));
      assert.ok(result.includes('value.length<=20'));
      assert.ok(result.includes('/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/'));
      assert.ok(result.includes('value.length>=8'));
      assert.ok(result.includes('value>=13'));
      assert.ok(result.includes('value===true'));
    });

    test('should generate validation hints for e-commerce order schema', () => {
      const orderSchema = s.object({
        orderId: s.string().validate(value => value.startsWith('ORD-')),
        items: s.array(s.object({
          productId: s.string().validate(value => value.length > 0),
          quantity: s.number().validate(value => value > 0 && Math.floor(value) === value),
          price: s.number().validate(value => value > 0)
        })).validate(arr => arr.length > 0),
        total: s.number().validate(value => value > 0),
        status: s.string().validate(value => ['pending', 'processing', 'shipped', 'delivered'].includes(value))
      });
      
      const result = orderSchema.stringify();
      
      // Check validation hints are present
      assert.ok(result.includes('orderId: string /* value => value.startsWith(\'ORD-\') */'));
      assert.ok(result.includes('productId: string /* value => value.length > 0 */'));
      assert.ok(result.includes('quantity: number /* value => value > 0 && Math.floor(value) === value */'));
      assert.ok(result.includes('price: number /* value => value > 0 */'));
      assert.ok(result.includes('total: number /* value => value > 0 */'));
      assert.ok(result.includes('status: string /* value => [\'pending\', \'processing\', \'shipped\', \'delivered\'].includes(value) */'));
      assert.ok(result.includes('}] /* arr => arr.length > 0 */'));
    });
  });

  describe('Function stringification edge cases', () => {
    test('should handle functions with special characters', () => {
      const schema = s.string().validate(value => value.includes('$') && value.includes('€'));
      const result = schema.stringify();
      assert.ok(result.includes('value.includes(\'$\')'));
      assert.ok(result.includes('value.includes(\'€\')'));
    });

    test('should handle functions with quotes', () => {
      const schema = s.string().validate(value => value.includes('"') || value.includes("'"));
      const result = schema.stringify();
      assert.ok(result.includes('string /* '));
      assert.ok(result.endsWith(' */'));
    });

    test('should handle functions with regex patterns', () => {
      const schema = s.string().validate(value => /^\d{4}-\d{2}-\d{2}$/.test(value));
      const result = schema.stringify();
      assert.ok(result.includes('/^\\d{4}-\\d{2}-\\d{2}$/'));
    });
  });
});