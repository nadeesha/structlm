import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index';

describe('Validation Hints in stringify()', () => {
  describe('Basic types with validation', () => {
    test('should include validation function for string schema', () => {
      const emailSchema = s.string().validate(value => value.includes('@'));
      assert.equal(
        emailSchema.stringify(),
        'string /* value=>value.includes("@") */'
      );
    });

    test('should include validation function for number schema', () => {
      const positiveSchema = s.number().validate(value => value > 0);
      assert.equal(positiveSchema.stringify(), 'number /* value=>value>0 */');
    });

    test('should include validation function for boolean schema', () => {
      const trueSchema = s.boolean().validate(value => value === true);
      assert.equal(trueSchema.stringify(), 'boolean /* value=>value===true */');
    });

    test('should include validation function for array schema', () => {
      const nonEmptyArray = s.array(s.string()).validate(arr => arr.length > 0);
      assert.equal(
        nonEmptyArray.stringify(),
        '[string] /* arr=>arr.length>0 */'
      );
    });

    test('should include validation function for object schema', () => {
      const userSchema = s
        .object({
          name: s.string(),
          age: s.number(),
        })
        .validate(obj => obj.name.length > 0);

      assert.equal(
        userSchema.stringify(),
        '{ name: string, age: number } /* obj=>obj.name.length>0 */'
      );
    });
  });

  describe('Complex validation functions', () => {
    test('should stringify complex string validations', () => {
      const complexEmailSchema = s.string().validate(ces => {
        return ces.includes('@') && ces.includes('.') && ces.length > 5;
      });

      const result = complexEmailSchema.stringify();

      assert.equal(
        result,
        'string /* ces=>{return ces.includes("@")&&ces.includes(".")&&ces.length>5} */'
      );
    });

    test('should stringify complex number validations', () => {
      const rangeSchema = s
        .number()
        .validate(value => value >= 0 && value <= 100);

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
        age: s.number().validate(value => value >= 18),
      });

      const result = userSchema.stringify();
      assert.equal(
        result,
        '{ name: string /* value=>value.length>=2 */, email: string /* value=>value.includes("@") */, age: number /* value=>value>=18 */ }'
      );
    });

    test('should include validation hints for nested arrays', () => {
      const arraySchema = s
        .array(
          s.object({
            id: s.string().validate(value => value.startsWith('ID-')),
            count: s.number().validate(value => value > 0),
          })
        )
        .validate(arr => arr.length > 0);

      const result = arraySchema.stringify();
      assert.equal(
        result,
        '[{ id: string /* value=>value.startsWith("ID-") */, count: number /* value=>value>0 */ }] /* arr=>arr.length>0 */'
      );
    });

    test('should handle deeply nested validation', () => {
      const deepSchema = s.object({
        user: s.object({
          profile: s
            .object({
              name: s.string().validate(value => value.length > 0),
              age: s.number().validate(value => value >= 0),
            })
            .validate(profile => profile.name !== 'admin'),
        }),
      });

      const result = deepSchema.stringify();
      assert.equal(
        result,
        '{ user: { profile: { name: string /* value=>value.length>0 */, age: number /* value=>value>=0 */ } /* profile=>profile.name!=="admin" */ } }'
      );
    });
  });

  describe('No validation function', () => {
    test('should not include validation hints when no validation function is provided', () => {
      assert.equal(s.string().stringify(), 'string');
      assert.equal(s.number().stringify(), 'number');
      assert.equal(s.boolean().stringify(), 'boolean');
      assert.equal(s.array(s.string()).stringify(), '[string]');
      assert.equal(
        s.object({ name: s.string() }).stringify(),
        '{ name: string }'
      );
    });
  });

  describe('Real-world examples', () => {
    test('should generate validation hints for user registration schema', () => {
      const userRegistrationSchema = s.object({
        username: s
          .string()
          .validate(uname => uname.length >= 3 && uname.length <= 20),
        email: s.string().validate(email => email.endsWith('@example.com')),
        password: s.string().validate(pass => pass.length >= 8),
        age: s.number().validate(age => age >= 13),
        termsAccepted: s.boolean().validate(accepted => accepted === true),
      });

      const result = userRegistrationSchema.stringify();

      assert.ok(
        result.includes(
          'username: string /* uname=>uname.length>=3&&uname.length<=20 */'
        )
      );
      assert.ok(
        result.includes(
          'email: string /* email=>email.endsWith("@example.com") */'
        )
      );
      assert.ok(result.includes('password: string /* pass=>pass.length>=8 */'));
      assert.ok(result.includes('age: number /* age=>age>=13 */'));
      assert.ok(
        result.includes(
          'termsAccepted: boolean /* accepted=>accepted===true */'
        )
      );
    });
  });

  test('should generate validation hints for e-commerce order schema', () => {
    const orderSchema = s.object({
      orderId: s.string().validate(value => value.startsWith('ORD-')),
      items: s
        .array(
          s.object({
            productId: s.string().validate(value => value.length > 0),
            quantity: s
              .number()
              .validate(value => value > 0 && Math.floor(value) === value),
            price: s.number().validate(value => value > 0),
          })
        )
        .validate(arr => arr.length > 0),
      total: s.number().validate(value => value > 0),
      status: s
        .string()
        .validate(value =>
          ['pending', 'processing', 'shipped', 'delivered'].includes(value)
        ),
    });

    const result = orderSchema.stringify();

    assert.equal(
      result,
      '{ orderId: string /* value=>value.startsWith("ORD-") */, items: [{ productId: string /* value=>value.length>0 */, quantity: number /* value=>value>0&&Math.floor(value)===value */, price: number /* value=>value>0 */ }] /* arr=>arr.length>0 */, total: number /* value=>value>0 */, status: string /* value=>["pending","processing","shipped","delivered"].includes(value) */ }'
    );
  });
});

describe('Function stringification edge cases', () => {
  test('should handle functions with special characters', () => {
    const schema = s.string().validate(value => value.includes('$'));
    const result = schema.stringify();
    assert.equal(result, 'string /* value=>value.includes("$") */');
  });

  test('should handle functions with regex patterns', () => {
    const schema = s
      .string()
      .validate(value => /^\d{4}-\d{2}-\d{2}$/.test(value));
    const result = schema.stringify();
    assert.equal(
      result,
      'string /* value=>/^\\d{4}-\\d{2}-\\d{2}$/.test(value) */'
    );
  });

  test('should handle functions with multiple conditions', () => {
    const schema = s
      .string()
      .validate(value => value.includes('@') && value.length > 5);
    const result = schema.stringify();
    assert.equal(
      result,
      'string /* value=>value.includes("@")&&value.length>5 */'
    );
  });
});
