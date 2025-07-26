// Sample data for simple object (book catalog) benchmarks
export const bookSampleInputs = [
  `Here are some books from our catalog:
  "The Great Gatsby" by F. Scott Fitzgerald was published in 1925. It's a classic American novel priced at $12.99 and currently in stock.
  "To Kill a Mockingbird" by Harper Lee, published in 1960, is a powerful drama available for $14.50 and is in stock.
  "1984" by George Orwell from 1949 is a dystopian fiction book priced at $13.25 but currently out of stock.`,

  `Book inventory update:
  "Pride and Prejudice" by Jane Austen (1813) - Romance - $11.99 - Available
  "The Catcher in the Rye" by J.D. Salinger (1951) - Coming-of-age fiction - $13.75 - In stock
  "Lord of the Flies" by William Golding (1954) - Adventure fiction - $12.50 - Out of stock
  "The Chronicles of Narnia" by C.S. Lewis (1950) - Fantasy - $19.99 - Available`,

  `Our bookstore has these titles:
  Title: "Dune", Author: Frank Herbert, Year: 1965, Genre: Science Fiction, Price: $16.99, Stock: Yes
  Title: "The Hobbit", Author: J.R.R. Tolkien, Year: 1937, Genre: Fantasy, Price: $14.99, Stock: Yes
  Title: "Brave New World", Author: Aldous Huxley, Year: 1932, Genre: Dystopian, Price: $13.99, Stock: No`,

  `Latest arrivals:
  "Harry Potter and the Philosopher's Stone" by J.K. Rowling (1997) is a fantasy novel for $15.99, currently available.
  "The Da Vinci Code" by Dan Brown (2003) is a mystery thriller for $14.99, in stock.
  "Gone Girl" by Gillian Flynn (2012) is a psychological thriller for $13.99, available.
  "The Girl with the Dragon Tattoo" by Stieg Larsson (2005) is a crime novel for $14.50, out of stock.`,

  `Book collection:
  "One Hundred Years of Solitude" - Gabriel García Márquez - 1967 - Magical realism - $15.50 - Available
  "The Kite Runner" - Khaled Hosseini - 2003 - Drama - $13.99 - In stock
  "Life of Pi" - Yann Martel - 2001 - Adventure - $12.99 - Out of stock`,
];

// Sample data for complex object (e-commerce order) benchmarks
export const orderSampleInputs = [
  `Order #ORD-2024-001 received on 2024-03-15
  Customer: John Smith, john.smith@email.com
  Address: 123 Main St, Springfield, IL 62701, USA
  
  Items: 
  - Wireless Headphones (WH-1000XM4) - Electronics - $299.99 - Qty: 1 - Discount: 10% - Subtotal: $269.99
  - Phone Case (iPhone 15) - Accessories - $29.99 - Qty: 2 - Discount: 0% - Subtotal: $59.98
  
  Payment: Credit Card, Transaction: CC123456789
  Billing: Same as shipping address
  Shipping: FedEx Express, Tracking: 1234567890, Est. delivery: 2024-03-18
  Order Status: Processing
  
  Subtotal: $329.97
  Discount: -$30.00
  Tax: $23.10
  Shipping: $15.99
  Total: $338.06`,

  `E-commerce Order Details:
  Order ID: ORD-2024-002
  Date: March 16, 2024
  Status: Shipped
  
  Customer Information:
  Name: Sarah Johnson
  Email: sarah.johnson@gmail.com
  Shipping Address: 456 Oak Avenue, Portland, OR 97201, USA
  
  Order Items:
  • Running Shoes (Nike Air) - Sports - $129.99 - Quantity: 1 - Discount: 15% - Item Total: $110.49
  • Workout Shirt - Clothing - $39.99 - Quantity: 2 - Discount: 0% - Item Total: $79.98
  • Water Bottle - Accessories - $24.99 - Quantity: 1 - Discount: 5% - Item Total: $23.74
  
  Payment Details: PayPal, Transaction ID: PP987654321
  Billing Address: Same as shipping
  Shipping Method: Standard Ground, Tracking: TRACK789, Expected: 2024-03-20
  Shipping Cost: $8.99
  
  Order Summary:
  Items Total: $214.21
  Discount Applied: -$20.85
  Tax Amount: $15.67
  Shipping Fee: $8.99
  Final Total: $218.02`,

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
  • Gaming Mouse - Gaming - $79.99 - Quantity: 1 - Discount: 0% - Subtotal: $79.99
  • Mechanical Keyboard - Gaming - $149.99 - Quantity: 1 - Discount: 10% - Subtotal: $134.99
  
  PAYMENT & SHIPPING:
  Payment Method: Business Credit Card
  Transaction Reference: BCC456789012
  Billing Address: Same as shipping address
  Shipping Carrier: UPS Next Day Air
  Tracking Number: UPS123456789
  Delivery Date: 2024-03-18
  Shipping charge: $24.99
  
  TOTAL BREAKDOWN:
  Merchandise: $2,019.03
  Discounts: -$189.00
  Tax: $148.57
  Shipping: $24.99
  GRAND TOTAL: $2,003.59`,

  `Purchase Receipt - Order #ORD-2024-004
  
  Customer: Emily Wilson <emily.wilson@email.com>
  Order Date: 2024-03-18
  Status: Delivered
  
  Delivery Address:
  Emily Wilson
  789 Pine Street
  Seattle, WA 98101
  United States
  
  Items Ordered:
  1x Smart Watch (SW-Series7) - Electronics - $399.99 - 10% off - $359.99
  2x Watch Bands - Accessories - $49.99 each - 0% off - $99.98
  1x Charging Cable - Accessories - $19.99 - 5% off - $18.99
  
  Payment Information:
  Method: Apple Pay
  Transaction: AP789012345
  Billing Address: Same as delivery
  
  Shipping Details:
  Method: Free Standard Shipping (orders over $100)
  Carrier: USPS Priority
  Tracking: USPS1234567890
  Delivered: 2024-03-21
  Shipping Cost: $0.00 (Free shipping)
  
  Financial Summary:
  Items: $478.96
  Promotional Discount: -$46.96
  Sales Tax: $32.94
  Shipping: $0.00
  Order Total: $464.94`,

  `JSON Order Data:
  {
    "order_id": "ORD-2024-005",
    "customer": {
      "name": "Robert Chen",
      "email": "robert.chen@tech.com",
      "address": {
        "street": "555 Technology Dr",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94107",
        "country": "USA"
      }
    },
    "order_date": "2024-03-19T10:30:00Z",
    "status": "processing",
    "items": [
      {
        "product_id": "TABLET-2024",
        "name": "Professional Tablet",
        "category": "Electronics",
        "price": 899.99,
        "quantity": 1,
        "discount_percent": 8,
        "subtotal": 827.99
      },
      {
        "product_id": "STYLUS-PRO",
        "name": "Digital Stylus Pro",
        "category": "Accessories",
        "price": 199.99,
        "quantity": 1,
        "discount_percent": 0,
        "subtotal": 199.99
      },
      {
        "product_id": "CASE-TABLET",
        "name": "Protective Case",
        "category": "Accessories",
        "price": 79.99,
        "quantity": 2,
        "discount_percent": 15,
        "subtotal": 135.98
      }
    ],
    "payment": {
      "method": "Credit Card",
      "transaction_id": "CC2024031901",
      "billing_address": {
        "street": "555 Technology Dr",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94107",
        "country": "USA"
      }
    },
    "shipping": {
      "carrier": "FedEx",
      "tracking_number": "FDX2024031901",
      "estimated_delivery": "2024-03-22",
      "shipping_cost": 15.95
    },
    "total_amount": 1195.87,
    "tax_amount": 76.95,
    "discount_amount": 87.00
  }`,
];

// Sample data for validation hints (user profile) benchmarks
export const userProfileSampleInputs = [
  `User Profile Information:
  User ID: usr_abc123
  Username: johndoe
  Email Address: john.doe@email.com
  Current Age: 28
  Active Status: true
  User Roles: ["user", "moderator"]
  
  Personal Data:
  First: John
  Last: Doe
  Biography: Software engineer with 5 years of experience in full-stack development
  Portfolio: https://johndoe.dev
  
  User Preferences:
  Theme Selection: dark
  Language Code: en
  Notifications Enabled: true
  
  Audit Trail:
  Created On: 2020-01-15T09:00:00Z
  Last Seen: 2024-03-20T14:25:00Z`,

  `Account Details:
  Account Number: usr_def456
  User Name: jane_smith
  Email: jane.smith@company.com
  Age: 35
  Is Active: true
  Permissions: ["admin", "user"]
  
  Profile Information:
  First Name: Jane
  Last Name: Smith
  Bio: Marketing director passionate about digital transformation
  Website: https://janesmith.portfolio.io
  
  Settings:
  UI Theme: light
  Language: fr
  Email Notifications: false
  
  Timestamps:
  Registration: 2019-06-20T16:45:00Z
  Last Login: 2024-03-20T11:15:00Z`,

  `Member Data:
  ID: usr_ghi789
  Login: alex_wilson
  Contact: alex.wilson@university.edu
  Current Age: 42
  Active Status: true
  User Roles: ["employee", "team_lead"]
  
  Personal Data:
  First: Alex
  Last: Wilson
  Biography: Product manager with expertise in agile methodologies
  Portfolio: https://alexwilson.portfolio.com
  
  User Preferences:
  Theme Selection: auto
  Language Code: es
  Notifications Enabled: false
  
  Audit Trail:
  Created On: 2021-03-10T11:20:00Z
  Last Seen: 2024-03-17T13:30:00Z`,

  `Account Details:
  Account Number: usr_jkl012
  User Name: emma_brown
  Email: emma.brown@startup.io
  Age: 26
  Is Active: true
  Permissions: ["user"]
  
  Profile Information:
  First Name: Emma
  Last Name: Brown
  Bio: UX designer focused on accessibility and user-centered design
  Website: https://emmabrown.design
  
  Preferences:
  Interface Theme: dark
  Primary Language: de
  Push Notifications: true
  
  System Data:
  Account Created: 2022-08-05T14:20:00Z
  Last Activity: 2024-03-19T16:45:00Z`,

  `User Registration Form:
  UserID: usr_mno345
  Handle: chris_tech
  EmailAddress: chris.tech@developer.org
  UserAge: 31
  AccountActive: true
  AccessLevels: ["developer", "contributor"]
  
  PersonalInfo:
  FirstName: Chris
  LastName: Tech
  AboutMe: Full-stack developer specializing in cloud architecture and DevOps
  PersonalSite: https://christech.cloud
  
  UserSettings:
  DisplayTheme: light
  LocaleCode: ja
  AlertsEnabled: true
  
  AccountHistory:
  SignupDate: 2023-01-12T08:30:00Z
  RecentLogin: 2024-03-20T09:15:00Z`,
];
