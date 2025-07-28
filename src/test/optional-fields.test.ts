import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index';

describe('Optional Fields', () => {
  describe('Basic Types - Stringification', () => {
    test('should stringify optional string field', () => {
      const schema = s.string().optional();
      assert.strictEqual(schema.stringify(), 'string /* optional */');
    });

    test('should stringify optional number field', () => {
      const schema = s.number().optional();
      assert.strictEqual(schema.stringify(), 'number /* optional */');
    });

    test('should stringify optional boolean field', () => {
      const schema = s.boolean().optional();
      assert.strictEqual(schema.stringify(), 'boolean /* optional */');
    });

    test('should stringify optional array field', () => {
      const schema = s.array(s.string()).optional();
      assert.strictEqual(schema.stringify(), '[string] /* optional */');
    });
  });

  describe('Combined with Validation', () => {
    test('should stringify optional field with validation', () => {
      const schema = s
        .string()
        .validate(x => x.length > 0)
        .optional();
      assert.strictEqual(
        schema.stringify(),
        'string /* x=>x.length>0, optional */'
      );
    });

    test('should stringify validation with optional (different order)', () => {
      const schema = s
        .string()
        .optional()
        .validate(x => x.length > 0);
      assert.strictEqual(
        schema.stringify(),
        'string /* x=>x.length>0, optional */'
      );
    });

    test('should stringify complex validation with optional', () => {
      const schema = s
        .number()
        .validate(n => n >= 0 && n <= 100)
        .optional();
      assert.strictEqual(
        schema.stringify(),
        'number /* n=>n>=0&&n<=100, optional */'
      );
    });
  });

  describe('Object with Optional Fields', () => {
    test('should stringify object with mixed optional and required fields', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
        email: s
          .string()
          .validate(e => e.includes('@'))
          .optional(),
        active: s.boolean(),
      });

      const result = schema.stringify();
      assert.strictEqual(
        result,
        '{ name: string, age: number /* optional */, email: string /* e=>e.includes("@"), optional */, active: boolean }'
      );
    });

    test('should stringify nested object with optional fields', () => {
      const schema = s.object({
        user: s.object({
          name: s.string(),
          nickname: s.string().optional(),
        }),
        metadata: s
          .object({
            created: s.string(),
            updated: s.string().optional(),
          })
          .optional(),
      });

      const result = schema.stringify();
      assert.strictEqual(
        result,
        '{ user: { name: string, nickname: string /* optional */ }, metadata: { created: string, updated: string /* optional */ } /* optional */ }'
      );
    });
  });

  describe('Parsing with Optional Fields', () => {
    test('should parse object with all fields present', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
        email: s.string().optional(),
      });

      const data = '{"name":"John","age":30,"email":"john@example.com"}';
      const result = schema.parse(data);

      assert.deepStrictEqual(result, {
        name: 'John',
        age: 30,
        email: 'john@example.com',
      });
    });

    test('should parse object with optional fields missing', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
        email: s.string().optional(),
      });

      const data = '{"name":"John"}';
      const result = schema.parse(data);

      assert.deepStrictEqual(result, {
        name: 'John',
      });
    });

    test('should parse object with some optional fields missing', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
        email: s.string().optional(),
        active: s.boolean(),
      });

      const data = '{"name":"John","email":"john@example.com","active":true}';
      const result = schema.parse(data);

      assert.deepStrictEqual(result, {
        name: 'John',
        email: 'john@example.com',
        active: true,
      });
    });

    test('should fail when required field is missing', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
      });

      const data = '{"age":30}';

      assert.throws(
        () => schema.parse(data),
        /Missing required property: name/
      );
    });

    test('should validate optional fields when present', () => {
      const schema = s.object({
        name: s.string(),
        email: s
          .string()
          .validate(e => e.includes('@'))
          .optional(),
      });

      const invalidData = '{"name":"John","email":"invalid-email"}';

      assert.throws(() => schema.parse(invalidData), /Validation failed/);
    });

    test('should not validate optional fields when missing', () => {
      const schema = s.object({
        name: s.string(),
        email: s
          .string()
          .validate(e => e.includes('@'))
          .optional(),
      });

      const data = '{"name":"John"}';
      const result = schema.parse(data);

      assert.deepStrictEqual(result, {
        name: 'John',
      });
    });
  });

  describe('Nested Optional Objects', () => {
    test('should handle optional nested objects', () => {
      const schema = s.object({
        user: s.string(),
        profile: s
          .object({
            bio: s.string(),
            website: s.string().optional(),
          })
          .optional(),
      });

      // With nested object
      const data1 =
        '{"user":"john","profile":{"bio":"Developer","website":"https://john.dev"}}';
      const result1 = schema.parse(data1);
      assert.deepStrictEqual(result1, {
        user: 'john',
        profile: {
          bio: 'Developer',
          website: 'https://john.dev',
        },
      });

      // Without nested object
      const data2 = '{"user":"john"}';
      const result2 = schema.parse(data2);
      assert.deepStrictEqual(result2, {
        user: 'john',
      });

      // With nested object but missing optional field inside
      const data3 = '{"user":"john","profile":{"bio":"Developer"}}';
      const result3 = schema.parse(data3);
      assert.deepStrictEqual(result3, {
        user: 'john',
        profile: {
          bio: 'Developer',
        },
      });
    });
  });

  describe('Optional Arrays', () => {
    test('should handle optional arrays', () => {
      const schema = s.object({
        name: s.string(),
        tags: s.array(s.string()).optional(),
        scores: s
          .array(s.number())
          .validate(arr => arr.length > 0)
          .optional(),
      });

      // With arrays
      const data1 = '{"name":"test","tags":["tag1","tag2"],"scores":[1,2,3]}';
      const result1 = schema.parse(data1);
      assert.deepStrictEqual(result1, {
        name: 'test',
        tags: ['tag1', 'tag2'],
        scores: [1, 2, 3],
      });

      // Without arrays
      const data2 = '{"name":"test"}';
      const result2 = schema.parse(data2);
      assert.deepStrictEqual(result2, {
        name: 'test',
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle null values for optional fields', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
      });

      // null should be treated as missing for optional fields
      const data = '{"name":"John","age":null}';

      // This should not throw since null parsing will fail but field is optional
      // However, since the field is present but null, it will try to parse and fail
      assert.throws(() => schema.parse(data), /Expected number, got object/);
    });

    test('should handle undefined values in objects', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
      });

      // undefined is not valid JSON, so this tests JavaScript object handling
      const obj = { name: 'John', age: undefined };
      const data = JSON.stringify(obj); // This removes undefined properties

      const result = schema.parse(data);
      assert.deepStrictEqual(result, {
        name: 'John',
      });
    });
  });
});
