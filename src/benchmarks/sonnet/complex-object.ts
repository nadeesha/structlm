#!/usr/bin/env node
import { config } from 'dotenv';
import {
  runComparison,
  printResults,
  BenchmarkConfig,
} from './complex-object-runner.js';
import { resolve } from 'path';

// Load environment variables from .env file in the same directory
config({ path: resolve(import.meta.dirname, '.env') });

const sampleInputTexts = [
  `Order #ORD-2024-001 received on 2024-03-15
  Customer: John Smith, john.smith@email.com
  Shipping Address: 123 Main St, San Francisco, CA 94102, USA
  
  Items ordered:
  - MacBook Pro 16" (Product ID: MBP-16-2024) - $2,499.00 x 1 = $2,499.00 (10% discount applied)
  - USB-C Hub (Product ID: HUB-001) - $89.99 x 2 = $179.98 (5% discount applied)
  
  Payment: Credit Card ending in 4567, Transaction ID: TXN-789123
  Billing Address: Same as shipping
  
  Shipping: FedEx Express, Tracking: 1234567890, Est. delivery: 2024-03-18
  Order Status: Processing
  
  Subtotal: $2,678.98
  Discount: -$259.89
  Tax: $193.45
  Shipping: $15.99
  Total: $2,628.53`,

  `E-commerce Order Details:
  Order ID: ORD-2024-002
  Date: March 16, 2024
  Status: Shipped
  
  Customer Information:
  Name: Sarah Johnson
  Email: sarah.johnson@gmail.com
  Address: 456 Oak Avenue, Austin, TX 78701, United States
  
  Product Details:
  1. Wireless Headphones (WH-1000XM4) - Electronics - $349.99 each - Qty: 1 - 15% off - Final: $297.49
  2. Phone Case (CASE-IP14) - Accessories - $24.99 each - Qty: 2 - 0% off - Final: $49.98
  3. Charging Cable (USB-C-3M) - Accessories - $19.99 each - Qty: 1 - 20% off - Final: $15.99
  
  Payment Method: PayPal
  Transaction Reference: PP-ABC123XYZ
  Billing Address: 789 Pine St, Austin, TX 78702, USA
  
  Shipping Details:
  Carrier: UPS Ground
  Tracking Number: 1Z999AA1234567890
  Estimated Delivery: March 20, 2024
  Shipping Cost: $8.99
  
  Order Summary:
  Items Total: $372.46
  Discount Applied: -$89.51
  Tax Amount: $25.67
  Shipping Fee: $8.99
  Final Total: $317.61`,

  `ORDER CONFIRMATION #ORD-2024-003
  
  Thank you for your purchase, Mike Davis!
  Order placed: 2024-03-17 14:30:00
  Current status: Confirmed
  
  CUSTOMER DETAILS:
  Mike Davis
  mike.davis@company.com
  Business Address: 321 Business Blvd, Suite 100, New York, NY 10001, USA
  
  ITEMS PURCHASED:
  • Gaming Laptop (Product: GL-RTX4070) - Gaming - $1,899.00 - Quantity: 1 - Discount: 5% - Subtotal: $1,804.05
  • Gaming Mouse (Product: GM-PRO) - Gaming - $79.99 - Quantity: 1 - Discount: 0% - Subtotal: $79.99
  • Mechanical Keyboard (Product: MK-RGB) - Gaming - $129.99 - Quantity: 1 - Discount: 10% - Subtotal: $116.99
  
  PAYMENT INFORMATION:
  Method: Visa Credit Card
  Transaction ID: CC-456789123
  Billing Address: 321 Business Blvd, Suite 100, New York, NY 10001, USA
  
  SHIPPING:
  DHL Express
  Tracking: DHL123456789
  Expected delivery: March 19, 2024
  Shipping charge: $24.99
  
  TOTAL BREAKDOWN:
  Merchandise: $2,001.03
  Discounts: -$189.00
  Tax: $148.57
  Shipping: $24.99
  GRAND TOTAL: $1,985.59`,

  `Purchase Receipt - Order #ORD-2024-004
  
  Customer: Emily Wilson <emily.wilson@email.com>
  Order Date: 2024-03-18
  Status: Delivered
  
  Delivery Address:
  Emily Wilson
  987 Elm Street
  Los Angeles, CA 90210
  United States
  
  Order Contents:
  1) Smart Watch Series 8 (SW-S8-GPS) | Health & Fitness | $399.99 | Qty: 1 | 8% discount | Line Total: $367.99
  2) Watch Band - Sport (WB-SPORT-BLK) | Accessories | $49.99 | Qty: 2 | 0% discount | Line Total: $99.98
  3) Screen Protector (SP-SW-S8) | Accessories | $12.99 | Qty: 1 | 15% discount | Line Total: $11.04
  
  Payment Details:
  Apple Pay
  Transaction: AP-789456123
  Billing Address: 987 Elm Street, Los Angeles, CA 90210, USA
  
  Fulfillment:
  Shipped via: Amazon Logistics
  Tracking Code: AMZ987654321
  Delivery Date: March 20, 2024
  Shipping Cost: $0.00 (Free shipping)
  
  Financial Summary:
  Items: $478.97
  Promotional Discount: -$46.96
  Sales Tax: $32.94
  Shipping: $0.00
  Order Total: $464.95`,

  `JSON Order Data:
  {
    "order_id": "ORD-2024-005",
    "customer": {
      "name": "Robert Chen",
      "email": "robert.chen@tech.com",
      "address": {
        "street": "555 Technology Dr",
        "city": "Seattle",
        "state": "WA",
        "zip_code": "98109",
        "country": "USA"
      }
    },
    "order_date": "2024-03-19",
    "status": "In Transit",
    "items": [
      {
        "product_id": "TB-PRO-13",
        "name": "Tablet Pro 13 inch",
        "category": "Electronics",
        "price": 899.00,
        "quantity": 1,
        "discount_percent": 12,
        "subtotal": 791.12
      },
      {
        "product_id": "KB-MAGIC",
        "name": "Magic Keyboard",
        "category": "Accessories",
        "price": 299.00,
        "quantity": 1,
        "discount_percent": 0,
        "subtotal": 299.00
      }
    ],
    "payment": {
      "method": "American Express",
      "transaction_id": "AMEX-555777999",
      "billing_address": {
        "street": "555 Technology Dr",
        "city": "Seattle",
        "state": "WA",
        "zip_code": "98109",
        "country": "USA"
      }
    },
    "shipping": {
      "carrier": "USPS Priority",
      "tracking_number": "USPS9876543210",
      "estimated_delivery": "2024-03-22",
      "shipping_cost": 12.95
    },
    "total_amount": 1167.83,
    "tax_amount": 64.76,
    "discount_amount": 107.88
  }`,
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  const iterations = parseInt(process.env.BENCHMARK_ITERATIONS || '5');

  const config: BenchmarkConfig = {
    iterations,
    apiKey,
    inputTexts: sampleInputTexts,
  };

  try {
    console.log(
      `Running benchmark with ${iterations} iterations per method...`
    );
    console.log(`Using ${sampleInputTexts.length} different input texts\n`);

    const results = await runComparison(config);
    printResults(results);

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-results/complex-object-results-${timestamp}.json`;

    await import('fs').then(fs => {
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
      console.log(`\nResults saved to: ${filename}`);
    });
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
