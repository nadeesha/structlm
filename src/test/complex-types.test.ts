import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index.js';

describe('Complex Types', () => {
  describe('s.array()', () => {
    test('should create an array schema with string items', () => {
      const schema = s.array(s.string());
      assert.strictEqual(schema.toString(), '[string]');
    });

    test('should create an array schema with number items', () => {
      const schema = s.array(s.number());
      assert.strictEqual(schema.toString(), '[number]');
    });

    test('should create an array schema with object items', () => {
      const schema = s.array(s.object({
        name: s.string(),
        age: s.number()
      }));
      assert.strictEqual(schema.toString(), '[{ name: string, age: number }]');
    });

    test('should support validation', () => {
      const schema = s.array(s.string()).validate(arr => arr.length > 0);
      assert.strictEqual(schema.toString(), '[string]');
      assert.strictEqual(typeof schema.validationFn, 'function');
    });

    test('should validate correctly', () => {
      const nonEmptyArraySchema = s.array(s.string()).validate(arr => arr.length > 0);
      assert.strictEqual(nonEmptyArraySchema.runValidation(['test']), true);
      assert.strictEqual(nonEmptyArraySchema.runValidation([]), false);
    });
  });

  describe('s.object()', () => {
    test('should create a simple object schema', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number()
      });
      assert.strictEqual(schema.toString(), '{ name: string, age: number }');
    });

    test('should create a nested object schema', () => {
      const schema = s.object({
        user: s.object({
          name: s.string(),
          age: s.number()
        }),
        active: s.boolean()
      });
      assert.strictEqual(schema.toString(), '{ user: { name: string, age: number }, active: boolean }');
    });

    test('should create an object with array property', () => {
      const schema = s.object({
        name: s.string(),
        tags: s.array(s.string())
      });
      assert.strictEqual(schema.toString(), '{ name: string, tags: [string] }');
    });

    test('should support validation', () => {
      const schema = s.object({
        name: s.string()
      }).validate(obj => obj.name.length > 0);
      assert.strictEqual(schema.toString(), '{ name: string }');
      assert.strictEqual(typeof schema.validationFn, 'function');
    });

    test('should validate correctly', () => {
      const nonEmptyNameSchema = s.object({
        name: s.string()
      }).validate(obj => obj.name.length > 0);
      assert.strictEqual(nonEmptyNameSchema.runValidation({ name: 'test' }), true);
      assert.strictEqual(nonEmptyNameSchema.runValidation({ name: '' }), false);
    });
  });

  describe('Complex nested structures', () => {
    test('should handle deeply nested objects', () => {
      const schema = s.object({
        user: s.object({
          profile: s.object({
            name: s.object({
              first: s.string(),
              last: s.string()
            }),
            contact: s.object({
              email: s.string(),
              phone: s.string()
            })
          }),
          permissions: s.array(s.string())
        })
      });
      
      const expected = '{ user: { profile: { name: { first: string, last: string }, contact: { email: string, phone: string } }, permissions: [string] } }';
      assert.strictEqual(schema.toString(), expected);
    });

    test('should handle arrays of complex objects', () => {
      const schema = s.array(s.object({
        id: s.number(),
        user: s.object({
          name: s.string(),
          active: s.boolean()
        }),
        tags: s.array(s.string())
      }));
      
      const expected = '[{ id: number, user: { name: string, active: boolean }, tags: [string] }]';
      assert.strictEqual(schema.toString(), expected);
    });
  });
});