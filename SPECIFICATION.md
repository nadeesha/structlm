# StructLM Serialization Specification

This document specifies how StructLM serializes JSON schema definitions into compact string representations.

## Overview

StructLM transforms schema definitions into TypeScript-like syntax with embedded validation hints. The serialization produces compact strings optimized for LLM consumption.

## Serialization Rules

### Primitive Types

#### String Type
- **Basic**: `string`
- **With validation**: `string /* validationFunction */`

```typescript
s.string().stringify()
// Output: "string"

s.string().validate(value => value.length > 0).stringify()
// Output: "string /* value=>value.length>0 */"
```

#### Number Type
- **Basic**: `number`
- **With validation**: `number /* validationFunction */`

```typescript
s.number().stringify()
// Output: "number"

s.number().validate(n => n > 0).stringify()
// Output: "number /* n=>n>0 */"
```

#### Boolean Type
- **Basic**: `boolean`  
- **With validation**: `boolean /* validationFunction */`

```typescript
s.boolean().stringify()
// Output: "boolean"

s.boolean().validate(b => b === true).stringify()
// Output: "boolean /* b=>b===true */"
```

### Complex Types

#### Array Type
- **Format**: `[itemType]`
- **With validation**: `[itemType] /* validationFunction */`

```typescript
s.array(s.string()).stringify()
// Output: "[string]"

s.array(s.number()).stringify()
// Output: "[number]"

s.array(s.string()).validate(arr => arr.length > 0).stringify()
// Output: "[string] /* arr=>arr.length>0 */"

// Nested arrays
s.array(s.array(s.number())).stringify()
// Output: "[[number]]"
```

#### Object Type
- **Format**: `{ key1: type1, key2: type2, ... }`
- **With validation**: `{ key1: type1, key2: type2, ... } /* validationFunction */`

```typescript
s.object({
  name: s.string(),
  age: s.number()
}).stringify()
// Output: "{ name: string, age: number }"

s.object({
  user: s.object({
    name: s.string(),
    email: s.string()
  }),
  active: s.boolean()
}).stringify()
// Output: "{ user: { name: string, email: string }, active: boolean }"
```

### Validation Function Serialization

Validation functions are serialized using `Function.prototype.toString()` within `/* */` comments:

```typescript
// Input function
(value) => value.length >= 3 && value.length <= 20

// Serialized output
"value=>value.length>=3&&value.length<=20"
```

#### Common Validation Patterns

```typescript
// String length
s.string().validate(value => value.length >= 3).stringify()
// "string /* value=>value.length>=3 */"

// Email pattern
s.string().validate(value => value.includes('@') && value.includes('.')).stringify()
// "string /* value=>value.includes("@")&&value.includes(".") */"

// Number range
s.number().validate(value => value >= 0 && value <= 100).stringify()
// "number /* value=>value>=0&&value<=100 */"

// Array length
s.array(s.string()).validate(arr => arr.length > 0).stringify()
// "[string] /* arr=>arr.length>0 */"

// Enum validation
s.string().validate(value => ['red', 'green', 'blue'].includes(value)).stringify()
// "string /* value=>["red","green","blue"].includes(value) */"
```

## Formatting Rules

### Spacing
- Object properties separated by `, ` (comma + space)
- Single space before and after `/* */` validation comments
- No additional whitespace for nested structures

### Property Ordering
Properties maintain the order defined in the schema:

```typescript
s.object({
  id: s.string(),
  name: s.string(), 
  email: s.string()
}).stringify()
// Output: "{ id: string, name: string, email: string }"
```

### No Trailing Elements
- No trailing commas
- Clean, compact syntax

## Complete Examples

### Simple Object
```typescript
const userSchema = s.object({
  name: s.string().validate(value => value.length > 0),
  age: s.number().validate(value => value >= 0 && value <= 120),
  email: s.string().validate(value => value.includes('@')),
  active: s.boolean()
});

userSchema.stringify()
```

**Output**:
```
{ 
  name: string /* value=>value.length>0 */, 
  age: number /* value=>value>=0&&value<=120 */, 
  email: string /* value=>value.includes("@") */, 
  active: boolean 
}
```

### Complex Nested Object
```typescript
const orderSchema = s.object({
  id: s.string(),
  customer: s.object({
    name: s.string(),
    address: s.object({
      street: s.string(),
      city: s.string()
    })
  }),
  items: s.array(
    s.object({
      name: s.string(),
      price: s.number().validate(value => value > 0),
      quantity: s.number()
    })
  )
});

orderSchema.stringify()
```

**Output**:
```
{ 
  id: string, 
  customer: { 
    name: string, 
    address: { street: string, city: string } 
  }, 
  items: [{ 
    name: string, 
    price: number /* value=>value>0 */, 
    quantity: number 
  }] 
}
```

### Array of Objects with Validation
```typescript
const booksSchema = s.object({
  books: s.array(
    s.object({
      title: s.string(),
      author: s.string(),
      year: s.number(),
      inStock: s.boolean()
    })
  ).validate(arr => arr.length > 0)
});

booksSchema.stringify()
```

**Output**:
```
{ 
  books: [{ 
    title: string, 
    author: string, 
    year: number, 
    inStock: boolean 
  }] /* arr=>arr.length>0 */ }
```

## Token Efficiency

StructLM serialization achieves significant token reduction compared to JSON Schema:

**JSON Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "number", "minimum": 0, "maximum": 120 }
  },
  "required": ["name", "age"]
}
```

**StructLM**:
```
{ 
  name: string /* value=>value.length>=1 */,
  age: number /* value=>value>=0&&value<=120 */ 
}
```
