import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index.js';

describe('toString() method', () => {
  describe('Basic types', () => {
    test('should return "string" for string schema', () => {
      assert.strictEqual(s.string().toString(), 'string');
    });

    test('should return "number" for number schema', () => {
      assert.strictEqual(s.number().toString(), 'number');
    });

    test('should return "boolean" for boolean schema', () => {
      assert.strictEqual(s.boolean().toString(), 'boolean');
    });

    test('should return same string even with validation', () => {
      assert.strictEqual(s.string().validate(s => s.length > 0).toString(), 'string');
      assert.strictEqual(s.number().validate(n => n > 0).toString(), 'number');
      assert.strictEqual(s.boolean().validate(b => b === true).toString(), 'boolean');
    });
  });

  describe('Array types', () => {
    test('should return correct format for string array', () => {
      assert.strictEqual(s.array(s.string()).toString(), '[string]');
    });

    test('should return correct format for number array', () => {
      assert.strictEqual(s.array(s.number()).toString(), '[number]');
    });

    test('should return correct format for boolean array', () => {
      assert.strictEqual(s.array(s.boolean()).toString(), '[boolean]');
    });

    test('should return correct format for object array', () => {
      const objectSchema = s.object({
        name: s.string(),
        age: s.number()
      });
      assert.strictEqual(s.array(objectSchema).toString(), '[{ name: string, age: number }]');
    });

    test('should return correct format for nested arrays', () => {
      const nestedArray = s.array(s.array(s.string()));
      assert.strictEqual(nestedArray.toString(), '[[string]]');
    });
  });

  describe('Object types', () => {
    test('should return correct format for simple object', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number()
      });
      assert.strictEqual(schema.toString(), '{ name: string, age: number }');
    });

    test('should return correct format for object with boolean', () => {
      const schema = s.object({
        name: s.string(),
        active: s.boolean()
      });
      assert.strictEqual(schema.toString(), '{ name: string, active: boolean }');
    });

    test('should return correct format for object with array', () => {
      const schema = s.object({
        name: s.string(),
        tags: s.array(s.string())
      });
      assert.strictEqual(schema.toString(), '{ name: string, tags: [string] }');
    });

    test('should return correct format for nested objects', () => {
      const schema = s.object({
        user: s.object({
          name: s.string(),
          age: s.number()
        }),
        active: s.boolean()
      });
      assert.strictEqual(schema.toString(), '{ user: { name: string, age: number }, active: boolean }');
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
            age: s.number()
          }),
          active: s.boolean()
        })
      });
      
      const expected = '{ user: { profile: { name: { first: string, last: string }, age: number }, active: boolean } }';
      assert.strictEqual(schema.toString(), expected);
    });

    test('should handle arrays of complex objects', () => {
      const schema = s.array(s.object({
        id: s.number(),
        user: s.object({
          name: s.string(),
          contact: s.object({
            email: s.string(),
            phone: s.string()
          })
        }),
        tags: s.array(s.string())
      }));
      
      const expected = '[{ id: number, user: { name: string, contact: { email: string, phone: string } }, tags: [string] }]';
      assert.strictEqual(schema.toString(), expected);
    });

    test('should handle objects with arrays of objects', () => {
      const schema = s.object({
        name: s.string(),
        users: s.array(s.object({
          id: s.number(),
          name: s.string(),
          active: s.boolean()
        })),
        metadata: s.object({
          count: s.number(),
          updated: s.string()
        })
      });
      
      const expected = '{ name: string, users: [{ id: number, name: string, active: boolean }], metadata: { count: number, updated: string } }';
      assert.strictEqual(schema.toString(), expected);
    });

    test('should handle mixed nested arrays and objects', () => {
      const schema = s.object({
        data: s.array(s.array(s.object({
          value: s.number(),
          label: s.string()
        }))),
        config: s.object({
          options: s.array(s.string()),
          enabled: s.boolean()
        })
      });
      
      const expected = '{ data: [[{ value: number, label: string }]], config: { options: [string], enabled: boolean } }';
      assert.strictEqual(schema.toString(), expected);
    });
  });

  describe('Real-world examples', () => {
    test('should generate correct notation for user schema', () => {
      const userSchema = s.object({
        id: s.number(),
        name: s.object({
          first: s.string(),
          last: s.string()
        }),
        email: s.string(),
        age: s.number(),
        active: s.boolean(),
        tags: s.array(s.string()),
        preferences: s.object({
          theme: s.string(),
          notifications: s.boolean()
        })
      });
      
      const expected = '{ id: number, name: { first: string, last: string }, email: string, age: number, active: boolean, tags: [string], preferences: { theme: string, notifications: boolean } }';
      assert.strictEqual(userSchema.toString(), expected);
    });

    test('should generate correct notation for API response schema', () => {
      const apiSchema = s.object({
        status: s.string(),
        data: s.array(s.object({
          id: s.number(),
          title: s.string(),
          completed: s.boolean()
        })),
        pagination: s.object({
          page: s.number(),
          limit: s.number(),
          total: s.number()
        })
      });
      
      const expected = '{ status: string, data: [{ id: number, title: string, completed: boolean }], pagination: { page: number, limit: number, total: number } }';
      assert.strictEqual(apiSchema.toString(), expected);
    });
  });
});