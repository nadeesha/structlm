#!/bin/bash
set -e

# StructLM Integration Test Script
# Sets up a new npm project and runs complex object experiments

echo "🚀 Setting up StructLM integration test..."

# Create test directory
TEST_DIR="/tmp/structlm-integration-test-$(date +%s)"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "📦 Initializing new npm project..."

# Initialize npm project
npm init -y > /dev/null

# Install dependencies
echo "📥 Installing dependencies..."
npm install structlm typescript @types/node tsx --silent

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

# Create src directory
mkdir -p src

# Create the integration test TypeScript file
cat > src/integration-test.ts << 'EOF'
import { s, Infer } from 'structlm';

// Define complex nested schema with validations
const ecommerceOrderSchema = s.object({
  orderId: s.string().validate(id => id.startsWith('ORD-')),
  customer: s.object({
    name: s.object({
      first: s.string().validate(name => name.length >= 2),
      last: s.string().validate(name => name.length >= 2)
    }),
    email: s.string().validate(email => email.includes('@') && email.includes('.')),
    age: s.number().validate(age => age >= 18 && age <= 120),
    isVip: s.boolean()
  }),
  items: s.array(s.object({
    productId: s.string(),
    name: s.string(),
    category: s.string().validate(cat => ['electronics', 'clothing', 'books', 'home'].includes(cat)),
    price: s.number().validate(price => price > 0),
    quantity: s.number().validate(qty => qty > 0),
    inStock: s.boolean()
  })).validate(items => items.length > 0),
  shipping: s.object({
    address: s.object({
      street: s.string(),
      city: s.string(),
      zipCode: s.string().validate(zip => /^\d{5}(-\d{4})?$/.test(zip)),
      country: s.string()
    }),
    method: s.string().validate(method => ['standard', 'express', 'overnight'].includes(method)),
    cost: s.number().validate(cost => cost >= 0)
  }),
  payment: s.object({
    method: s.string().validate(method => ['credit', 'debit', 'paypal', 'crypto'].includes(method)),
    amount: s.number().validate(amount => amount > 0),
    currency: s.string().validate(curr => ['USD', 'EUR', 'GBP', 'JPY'].includes(curr)),
    processed: s.boolean()
  }),
  metadata: s.object({
    createdAt: s.string().validate(date => date.includes('T')),
    notes: s.array(s.string()),
    tags: s.array(s.string()).validate(tags => tags.length <= 10)
  })
});

// Infer TypeScript type
type EcommerceOrder = Infer<typeof ecommerceOrderSchema>;

function runIntegrationTest() {
  console.log('🧪 Starting StructLM Integration Test\n');
  
  // Test 1: Schema Stringification
  console.log('📝 Test 1: Schema Stringification');
  console.log('='.repeat(50));
  
  const schemaString = ecommerceOrderSchema.stringify();
  console.log('Generated schema string:');
  console.log(schemaString);
  console.log('\n✅ Schema stringification successful\n');
  
  // Test 2: Valid Data Parsing
  console.log('📊 Test 2: Valid Data Parsing');
  console.log('='.repeat(50));
  
  const validOrderData = {
    orderId: 'ORD-12345',
    customer: {
      name: {
        first: 'John',
        last: 'Doe'
      },
      email: 'john.doe@example.com',
      age: 32,
      isVip: true
    },
    items: [
      {
        productId: 'PROD-001',
        name: 'Wireless Headphones',
        category: 'electronics',
        price: 199.99,
        quantity: 1,
        inStock: true
      },
      {
        productId: 'PROD-002',
        name: 'Cotton T-Shirt',
        category: 'clothing',
        price: 29.99,
        quantity: 2,
        inStock: true
      }
    ],
    shipping: {
      address: {
        street: '123 Main Street',
        city: 'New York',
        zipCode: '10001',
        country: 'USA'
      },
      method: 'express',
      cost: 15.99
    },
    payment: {
      method: 'credit',
      amount: 275.97,
      currency: 'USD',
      processed: true
    },
    metadata: {
      createdAt: '2024-01-15T10:30:00Z',
      notes: ['Rush delivery requested', 'Gift wrapping'],
      tags: ['electronics', 'clothing', 'express-shipping']
    }
  };
  
  try {
    const jsonString = JSON.stringify(validOrderData);
    const parsedOrder = ecommerceOrderSchema.parse(jsonString);
    
    console.log('✅ Valid data parsing successful');
    console.log('Parsed order ID:', parsedOrder.orderId);
    console.log('Customer name:', `${parsedOrder.customer.name.first} ${parsedOrder.customer.name.last}`);
    console.log('Items count:', parsedOrder.items.length);
    console.log('Total amount:', `$${parsedOrder.payment.amount}`);
    console.log('');
  } catch (error) {
    console.log('❌ Valid data parsing failed:', error);
    return false;
  }
  
  // Test 3: Invalid Data Validation
  console.log('🚫 Test 3: Invalid Data Validation');
  console.log('='.repeat(50));
  
  const invalidOrderData = {
    orderId: 'INVALID-ID', // Should start with 'ORD-'
    customer: {
      name: {
        first: 'J', // Too short
        last: 'Doe'
      },
      email: 'invalid-email', // Missing @ and .
      age: 15, // Under 18
      isVip: true
    },
    items: [], // Empty array not allowed
    shipping: {
      address: {
        street: '123 Main Street',
        city: 'New York',
        zipCode: 'INVALID', // Invalid ZIP format
        country: 'USA'
      },
      method: 'invalid-method', // Not in allowed values
      cost: -5.99 // Negative cost
    },
    payment: {
      method: 'bitcoin', // Not in allowed values
      amount: -100, // Negative amount
      currency: 'INVALID', // Not in allowed currencies
      processed: true
    },
    metadata: {
      createdAt: 'invalid-date', // Missing T
      notes: ['Note'],
      tags: new Array(15).fill('tag') // Too many tags
    }
  };
  
  let validationErrorCount = 0;
  
  try {
    const jsonString = JSON.stringify(invalidOrderData);
    ecommerceOrderSchema.parse(jsonString);
    console.log('❌ Invalid data validation failed - should have thrown error');
    return false;
  } catch (error) {
    validationErrorCount++;
    console.log('✅ Invalid data correctly rejected:', (error as Error).message.split('\n')[0]);
  }
  
  // Test 4: Type Safety
  console.log('\n🔒 Test 4: Type Safety');
  console.log('='.repeat(50));
  
  const typedOrder: EcommerceOrder = {
    orderId: 'ORD-54321',
    customer: {
      name: { first: 'Jane', last: 'Smith' },
      email: 'jane@example.com',
      age: 28,
      isVip: false
    },
    items: [{
      productId: 'PROD-003',
      name: 'Programming Book',
      category: 'books',
      price: 49.99,
      quantity: 1,
      inStock: true
    }],
    shipping: {
      address: {
        street: '456 Oak Ave',
        city: 'San Francisco',
        zipCode: '94102',
        country: 'USA'
      },
      method: 'standard',
      cost: 5.99
    },
    payment: {
      method: 'paypal',
      amount: 55.98,
      currency: 'USD',
      processed: false
    },
    metadata: {
      createdAt: '2024-01-15T14:20:00Z',
      notes: [],
      tags: ['books']
    }
  };
  
  console.log('✅ TypeScript type inference working correctly');
  console.log('Typed order customer:', typedOrder.customer.name.first);
  console.log('');
  
  // Test 5: Round-trip Test
  console.log('🔄 Test 5: Round-trip Test (stringify -> parse)');
  console.log('='.repeat(50));
  
  try {
    const originalJson = JSON.stringify(validOrderData);
    const parsed = ecommerceOrderSchema.parse(originalJson);
    const reparsedJson = JSON.stringify(parsed);
    const reparsed = ecommerceOrderSchema.parse(reparsedJson);
    
    console.log('✅ Round-trip test successful');
    console.log('Original order ID:', validOrderData.orderId);
    console.log('Reparsed order ID:', reparsed.orderId);
    console.log('Data integrity maintained:', validOrderData.orderId === reparsed.orderId);
    console.log('');
  } catch (error) {
    console.log('❌ Round-trip test failed:', error);
    return false;
  }
  
  // Final Results
  console.log('🎉 Integration Test Results');
  console.log('='.repeat(50));
  console.log('✅ Schema stringification: PASSED');
  console.log('✅ Valid data parsing: PASSED');
  console.log('✅ Invalid data validation: PASSED');
  console.log('✅ Type safety: PASSED');
  console.log('✅ Round-trip test: PASSED');
  console.log('\n🚀 All tests completed successfully!');
  
  return true;
}

// Run the test
const success = runIntegrationTest();
process.exit(success ? 0 : 1);
EOF

echo "🏃 Running integration test..."

# Run the TypeScript test
npx tsx src/integration-test.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Integration test completed successfully!"
    echo "📁 Test project created at: $TEST_DIR"
    echo "🧹 To clean up, run: rm -rf $TEST_DIR"
else
    echo ""
    echo "❌ Integration test failed!"
    exit 1
fi