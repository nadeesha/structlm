import { test, describe } from 'node:test';
import assert from 'node:assert';
import { s } from '../index';

describe('parse() method', () => {
  describe('Basic types', () => {
    describe('String parsing', () => {
      test('should parse valid string JSON', () => {
        const schema = s.string();
        const result = schema.parse('"hello world"');
        assert.strictEqual(result, 'hello world');
        assert.strictEqual(typeof result, 'string');
      });

      test('should parse empty string', () => {
        const schema = s.string();
        const result = schema.parse('""');
        assert.strictEqual(result, '');
      });

      test('should parse string with special characters', () => {
        const schema = s.string();
        const result = schema.parse('"Hello \\"World\\" with \\n newline"');
        assert.strictEqual(result, 'Hello "World" with \n newline');
      });

      test('should throw error for non-string values', () => {
        const schema = s.string();
        assert.throws(() => schema.parse('123'), /Expected string, got number/);
        assert.throws(
          () => schema.parse('true'),
          /Expected string, got boolean/
        );
        assert.throws(
          () => schema.parse('null'),
          /Expected string, got object/
        );
        assert.throws(() => schema.parse('[]'), /Expected string, got object/);
      });

      test('should throw error for invalid JSON', () => {
        const schema = s.string();
        assert.throws(() => schema.parse('invalid json'), /Invalid JSON/);
        assert.throws(() => schema.parse('"unclosed string'), /Invalid JSON/);
      });

      test('should validate string with custom validation', () => {
        const emailSchema = s.string().validate(str => str.includes('@'));
        const result = emailSchema.parse('"test@example.com"');
        assert.strictEqual(result, 'test@example.com');
      });

      test('should throw validation error for invalid string', () => {
        const emailSchema = s.string().validate(str => str.includes('@'));
        assert.throws(
          () => emailSchema.parse('"invalid-email"'),
          /Validation failed/
        );
      });
    });

    describe('Number parsing', () => {
      test('should parse valid number JSON', () => {
        const schema = s.number();
        assert.strictEqual(schema.parse('42'), 42);
        assert.strictEqual(schema.parse('3.14'), 3.14);
        assert.strictEqual(schema.parse('-10'), -10);
        assert.strictEqual(schema.parse('0'), 0);
      });

      test('should parse scientific notation', () => {
        const schema = s.number();
        assert.strictEqual(schema.parse('1e10'), 1e10);
        assert.strictEqual(schema.parse('2.5e-3'), 2.5e-3);
      });

      test('should throw error for non-number values', () => {
        const schema = s.number();
        assert.throws(
          () => schema.parse('"123"'),
          /Expected number, got string/
        );
        assert.throws(
          () => schema.parse('true'),
          /Expected number, got boolean/
        );
        assert.throws(
          () => schema.parse('null'),
          /Expected number, got object/
        );
        assert.throws(() => schema.parse('[]'), /Expected number, got object/);
      });

      test('should validate number with custom validation', () => {
        const positiveSchema = s.number().validate(n => n > 0);
        const result = positiveSchema.parse('5');
        assert.strictEqual(result, 5);
      });

      test('should throw validation error for invalid number', () => {
        const positiveSchema = s.number().validate(n => n > 0);
        assert.throws(() => positiveSchema.parse('-5'), /Validation failed/);
      });
    });

    describe('Boolean parsing', () => {
      test('should parse valid boolean JSON', () => {
        const schema = s.boolean();
        assert.strictEqual(schema.parse('true'), true);
        assert.strictEqual(schema.parse('false'), false);
      });

      test('should throw error for non-boolean values', () => {
        const schema = s.boolean();
        assert.throws(() => schema.parse('1'), /Expected boolean, got number/);
        assert.throws(
          () => schema.parse('"true"'),
          /Expected boolean, got string/
        );
        assert.throws(
          () => schema.parse('null'),
          /Expected boolean, got object/
        );
        assert.throws(() => schema.parse('[]'), /Expected boolean, got object/);
      });

      test('should validate boolean with custom validation', () => {
        const trueBooleanSchema = s.boolean().validate(b => b === true);
        const result = trueBooleanSchema.parse('true');
        assert.strictEqual(result, true);
      });

      test('should throw validation error for invalid boolean', () => {
        const trueBooleanSchema = s.boolean().validate(b => b === true);
        assert.throws(
          () => trueBooleanSchema.parse('false'),
          /Validation failed/
        );
      });
    });
  });

  describe('Array parsing', () => {
    test('should parse empty array', () => {
      const schema = s.array(s.string());
      const result = schema.parse('[]');
      assert.deepStrictEqual(result, []);
      assert.ok(Array.isArray(result));
    });

    test('should parse string array', () => {
      const schema = s.array(s.string());
      const result = schema.parse('["hello", "world", "test"]');
      assert.deepStrictEqual(result, ['hello', 'world', 'test']);
    });

    test('should parse number array', () => {
      const schema = s.array(s.number());
      const result = schema.parse('[1, 2, 3, 4.5, -10]');
      assert.deepStrictEqual(result, [1, 2, 3, 4.5, -10]);
    });

    test('should parse boolean array', () => {
      const schema = s.array(s.boolean());
      const result = schema.parse('[true, false, true]');
      assert.deepStrictEqual(result, [true, false, true]);
    });

    test('should parse nested arrays', () => {
      const schema = s.array(s.array(s.number()));
      const result = schema.parse('[[1, 2], [3, 4], []]');
      assert.deepStrictEqual(result, [[1, 2], [3, 4], []]);
    });

    test('should throw error for non-array values', () => {
      const schema = s.array(s.string());
      assert.throws(
        () => schema.parse('"not array"'),
        /Expected array, got string/
      );
      assert.throws(() => schema.parse('123'), /Expected array, got number/);
      assert.throws(() => schema.parse('{}'), /Expected array, got object/);
    });

    test('should throw error for invalid array item types', () => {
      const schema = s.array(s.string());
      assert.throws(
        () => schema.parse('[1, 2, 3]'),
        /Array item at index 0.*Expected string, got number/
      );
      assert.throws(
        () => schema.parse('["valid", 123, "also valid"]'),
        /Array item at index 1.*Expected string, got number/
      );
    });

    test('should validate array with custom validation', () => {
      const nonEmptySchema = s
        .array(s.string())
        .validate(arr => arr.length > 0);
      const result = nonEmptySchema.parse('["test"]');
      assert.deepStrictEqual(result, ['test']);
    });

    test('should throw validation error for invalid array', () => {
      const nonEmptySchema = s
        .array(s.string())
        .validate(arr => arr.length > 0);
      assert.throws(
        () => nonEmptySchema.parse('[]'),
        /Array validation failed/
      );
    });

    test('should parse array of objects', () => {
      const schema = s.array(
        s.object({
          name: s.string(),
          age: s.number(),
        })
      );
      const result = schema.parse(
        '[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
      );
      assert.deepStrictEqual(result, [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]);
    });
  });

  describe('Object parsing', () => {
    test('should parse simple object', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
        active: s.boolean(),
      });
      const result = schema.parse(
        '{"name": "John", "age": 30, "active": true}'
      );
      assert.deepStrictEqual(result, {
        name: 'John',
        age: 30,
        active: true,
      });
    });

    test('should parse nested object', () => {
      const schema = s.object({
        user: s.object({
          name: s.string(),
          email: s.string(),
        }),
        count: s.number(),
      });
      const result = schema.parse(
        '{"user": {"name": "John", "email": "john@example.com"}, "count": 5}'
      );
      assert.deepStrictEqual(result, {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        count: 5,
      });
    });

    test('should parse object with array properties', () => {
      const schema = s.object({
        name: s.string(),
        tags: s.array(s.string()),
        scores: s.array(s.number()),
      });
      const result = schema.parse(
        '{"name": "Test", "tags": ["tag1", "tag2"], "scores": [1, 2, 3]}'
      );
      assert.deepStrictEqual(result, {
        name: 'Test',
        tags: ['tag1', 'tag2'],
        scores: [1, 2, 3],
      });
    });

    test('should throw error for non-object values', () => {
      const schema = s.object({ name: s.string() });
      assert.throws(
        () => schema.parse('"not object"'),
        /Expected object, got string/
      );
      assert.throws(() => schema.parse('123'), /Expected object, got number/);
      assert.throws(() => schema.parse('[]'), /Expected object, got array/);
      assert.throws(() => schema.parse('null'), /Expected object, got object/);
    });

    test('should throw error for missing required properties', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });
      assert.throws(
        () => schema.parse('{"name": "John"}'),
        /Missing required property: age/
      );
      assert.throws(
        () => schema.parse('{"age": 30}'),
        /Missing required property: name/
      );
      assert.throws(
        () => schema.parse('{}'),
        /Missing required property: name/
      );
    });

    test('should throw error for invalid property types', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });
      assert.throws(
        () => schema.parse('{"name": 123, "age": 30}'),
        /Property 'name'.*Expected string, got number/
      );
      assert.throws(
        () => schema.parse('{"name": "John", "age": "thirty"}'),
        /Property 'age'.*Expected number, got string/
      );
    });

    test('should validate object with custom validation', () => {
      const schema = s
        .object({
          name: s.string(),
          age: s.number(),
        })
        .validate(obj => obj.age >= 18);

      const result = schema.parse('{"name": "John", "age": 25}');
      assert.deepStrictEqual(result, { name: 'John', age: 25 });
    });

    test('should throw validation error for invalid object', () => {
      const schema = s
        .object({
          name: s.string(),
          age: s.number(),
        })
        .validate(obj => obj.age >= 18);

      assert.throws(
        () => schema.parse('{"name": "John", "age": 16}'),
        /Object validation failed/
      );
    });
  });

  describe('Complex nested structures', () => {
    test('should parse deeply nested object', () => {
      const schema = s.object({
        user: s.object({
          profile: s.object({
            name: s.object({
              first: s.string(),
              last: s.string(),
            }),
            age: s.number(),
          }),
          preferences: s.object({
            theme: s.string(),
            notifications: s.boolean(),
          }),
        }),
        metadata: s.object({
          created: s.string(),
          updated: s.string(),
        }),
      });

      const input = `{
        "user": {
          "profile": {
            "name": {
              "first": "John",
              "last": "Doe"
            },
            "age": 30
          },
          "preferences": {
            "theme": "dark",
            "notifications": true
          }
        },
        "metadata": {
          "created": "2023-01-01",
          "updated": "2023-12-31"
        }
      }`;

      const result = schema.parse(input);
      assert.deepStrictEqual(result, {
        user: {
          profile: {
            name: {
              first: 'John',
              last: 'Doe',
            },
            age: 30,
          },
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
        metadata: {
          created: '2023-01-01',
          updated: '2023-12-31',
        },
      });
    });

    test('should parse complex mixed types', () => {
      const schema = s.object({
        data: s.array(
          s.object({
            id: s.number(),
            tags: s.array(s.string()),
            meta: s.object({
              visible: s.boolean(),
              priority: s.number(),
            }),
          })
        ),
        config: s.object({
          enabled: s.boolean(),
          options: s.array(s.string()),
        }),
      });

      const input = `{
        "data": [
          {
            "id": 1,
            "tags": ["important", "urgent"],
            "meta": {
              "visible": true,
              "priority": 10
            }
          },
          {
            "id": 2,
            "tags": ["normal"],
            "meta": {
              "visible": false,
              "priority": 5
            }
          }
        ],
        "config": {
          "enabled": true,
          "options": ["opt1", "opt2"]
        }
      }`;

      const result = schema.parse(input);
      assert.deepStrictEqual(result, {
        data: [
          {
            id: 1,
            tags: ['important', 'urgent'],
            meta: {
              visible: true,
              priority: 10,
            },
          },
          {
            id: 2,
            tags: ['normal'],
            meta: {
              visible: false,
              priority: 5,
            },
          },
        ],
        config: {
          enabled: true,
          options: ['opt1', 'opt2'],
        },
      });
    });
  });

  describe('Real-world examples', () => {
    test('should parse user registration data', () => {
      const schema = s.object({
        username: s.string().validate(name => name.length >= 3),
        email: s.string().validate(email => email.includes('@')),
        age: s.number().validate(age => age >= 13),
        preferences: s.object({
          newsletter: s.boolean(),
          theme: s
            .string()
            .validate(theme => ['light', 'dark'].includes(theme)),
        }),
        tags: s.array(s.string()),
      });

      const input = `{
        "username": "john_doe",
        "email": "john@example.com",
        "age": 25,
        "preferences": {
          "newsletter": true,
          "theme": "dark"
        },
        "tags": ["developer", "typescript"]
      }`;

      const result = schema.parse(input);
      assert.deepStrictEqual(result, {
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
        preferences: {
          newsletter: true,
          theme: 'dark',
        },
        tags: ['developer', 'typescript'],
      });
    });

    test('should throw detailed validation errors', () => {
      const schema = s.object({
        username: s.string().validate(name => name.length >= 3),
        email: s.string().validate(email => email.includes('@')),
        age: s.number().validate(age => age >= 13),
      });

      // Test username validation failure
      assert.throws(
        () =>
          schema.parse(
            '{"username": "jo", "email": "john@example.com", "age": 25}'
          ),
        /Property 'username'.*Validation failed/
      );

      // Test email validation failure
      assert.throws(
        () =>
          schema.parse(
            '{"username": "john", "email": "invalid-email", "age": 25}'
          ),
        /Property 'email'.*Validation failed/
      );

      // Test age validation failure
      assert.throws(
        () =>
          schema.parse(
            '{"username": "john", "email": "john@example.com", "age": 10}'
          ),
        /Property 'age'.*Validation failed/
      );
    });
  });

  describe('Error handling and edge cases', () => {
    test('should provide clear error messages for JSON syntax errors', () => {
      const schema = s.string();
      assert.throws(() => schema.parse('invalid json'), /Invalid JSON/);
      assert.throws(
        () => schema.parse('{"unclosed": "object"'),
        /Invalid JSON/
      );
      assert.throws(() => schema.parse('[1, 2, 3,]'), /Invalid JSON/);
    });

    test('should handle null values appropriately', () => {
      const schema = s.string();
      assert.throws(() => schema.parse('null'), /Expected string, got object/);
    });

    test('should handle undefined/missing input', () => {
      const schema = s.string();
      assert.throws(() => schema.parse(''), /Invalid JSON/);
    });

    test('should provide detailed error paths for nested failures', () => {
      const schema = s.object({
        users: s.array(
          s.object({
            name: s.string(),
            age: s.number(),
          })
        ),
      });

      assert.throws(
        () => schema.parse('{"users": [{"name": "John", "age": "invalid"}]}'),
        /Property 'users'.*Array item at index 0.*Property 'age'.*Expected number, got string/
      );
    });
  });

  describe('stringify() and parse() roundtrip', () => {
    test('should roundtrip simple values', () => {
      const stringSchema = s.string();
      const numberSchema = s.number();
      const booleanSchema = s.boolean();

      const stringValue = 'hello world';
      const numberValue = 42.5;
      const booleanValue = true;

      assert.strictEqual(
        stringSchema.parse(JSON.stringify(stringValue)),
        stringValue
      );
      assert.strictEqual(
        numberSchema.parse(JSON.stringify(numberValue)),
        numberValue
      );
      assert.strictEqual(
        booleanSchema.parse(JSON.stringify(booleanValue)),
        booleanValue
      );
    });

    test('should roundtrip complex objects', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
        active: s.boolean(),
        tags: s.array(s.string()),
        profile: s.object({
          email: s.string(),
          preferences: s.object({
            theme: s.string(),
          }),
        }),
      });

      const originalValue = {
        name: 'John Doe',
        age: 30,
        active: true,
        tags: ['developer', 'typescript'],
        profile: {
          email: 'john@example.com',
          preferences: {
            theme: 'dark',
          },
        },
      };

      const parsedValue = schema.parse(JSON.stringify(originalValue));
      assert.deepStrictEqual(parsedValue, originalValue);
    });

    test('should roundtrip with validation', () => {
      const schema = s.object({
        email: s.string().validate(email => email.includes('@')),
        age: s.number().validate(age => age >= 18),
        tags: s.array(s.string()).validate(arr => arr.length > 0),
      });

      const validValue = {
        email: 'test@example.com',
        age: 25,
        tags: ['valid', 'tags'],
      };

      const parsedValue = schema.parse(JSON.stringify(validValue));
      assert.deepStrictEqual(parsedValue, validValue);
    });
  });
});
