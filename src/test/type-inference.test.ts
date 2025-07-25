import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s, Infer } from '../index';

describe('Type Inference', () => {
  test('should infer string type from s.string()', () => {
    const schema = s.string();
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = 'hello';
    assert.strictEqual(typeof value, 'string');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), 'string');
  });

  test('should infer number type from s.number()', () => {
    const schema = s.number();
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = 42;
    assert.strictEqual(typeof value, 'number');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), 'number');
  });

  test('should infer boolean type from s.boolean()', () => {
    const schema = s.boolean();
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = true;
    assert.strictEqual(typeof value, 'boolean');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), 'boolean');
  });

  test('should infer string[] type from s.array(s.string())', () => {
    const schema = s.array(s.string());
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = ['hello', 'world'];
    assert.strictEqual(Array.isArray(value), true);
    assert.strictEqual(typeof value[0], 'string');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), '[string]');
  });

  test('should infer number[] type from s.array(s.number())', () => {
    const schema = s.array(s.number());
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = [1, 2, 3];
    assert.strictEqual(Array.isArray(value), true);
    assert.strictEqual(typeof value[0], 'number');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), '[number]');
  });

  test('should infer simple object type from s.object()', () => {
    const schema = s.object({
      name: s.string(),
      age: s.number(),
    });
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = {
      name: 'John',
      age: 30,
    };
    assert.strictEqual(typeof value.name, 'string');
    assert.strictEqual(typeof value.age, 'number');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), '{ name: string, age: number }');
  });

  test('should infer nested object type', () => {
    const schema = s.object({
      user: s.object({
        name: s.string(),
        active: s.boolean(),
      }),
      count: s.number(),
    });
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = {
      user: {
        name: 'Jane',
        active: true,
      },
      count: 5,
    };
    assert.strictEqual(typeof value.user.name, 'string');
    assert.strictEqual(typeof value.user.active, 'boolean');
    assert.strictEqual(typeof value.count, 'number');

    // Verify the schema works
    assert.strictEqual(
      schema.stringify(),
      '{ user: { name: string, active: boolean }, count: number }'
    );
  });

  test('should infer object with array property type', () => {
    const schema = s.object({
      name: s.string(),
      tags: s.array(s.string()),
    });
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = {
      name: 'Test',
      tags: ['tag1', 'tag2'],
    };
    assert.strictEqual(typeof value.name, 'string');
    assert.strictEqual(Array.isArray(value.tags), true);
    assert.strictEqual(typeof value.tags[0], 'string');

    // Verify the schema works
    assert.strictEqual(schema.stringify(), '{ name: string, tags: [string] }');
  });

  test('should infer complex nested types', () => {
    const schema = s.object({
      users: s.array(
        s.object({
          id: s.number(),
          profile: s.object({
            name: s.string(),
            active: s.boolean(),
          }),
          tags: s.array(s.string()),
        })
      ),
    });
    type InferredType = Infer<typeof schema>;

    // This should compile without errors if type inference is working
    const value: InferredType = {
      users: [
        {
          id: 1,
          profile: {
            name: 'Alice',
            active: true,
          },
          tags: ['admin', 'user'],
        },
      ],
    };

    if (value.users[0] === undefined) {
      throw new Error('users[0] is undefined');
    }

    assert.strictEqual(typeof value.users[0].id, 'number');
    assert.strictEqual(typeof value.users[0].profile.name, 'string');
    assert.strictEqual(typeof value.users[0].profile.active, 'boolean');
    assert.strictEqual(Array.isArray(value.users[0].tags), true);

    // Verify the schema works
    const expected =
      '{ users: [{ id: number, profile: { name: string, active: boolean }, tags: [string] }] }';
    assert.strictEqual(schema.stringify(), expected);
  });
});
