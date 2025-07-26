import { s, Infer } from '../../index';

// Simple book catalog schema
export const bookSchema = s.object({
  books: s.array(
    s.object({
      title: s.string(),
      author: s.string(),
      publication_year: s.number(),
      genre: s.string(),
      price: s.number(),
      in_stock: s.boolean(),
    })
  ),
});

export type BookCatalogType = Infer<typeof bookSchema>;

export const bookJsonSchema = {
  type: 'object',
  properties: {
    books: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          publication_year: { type: 'integer' },
          genre: { type: 'string' },
          price: { type: 'number' },
          in_stock: { type: 'boolean' },
        },
        required: [
          'title',
          'author',
          'publication_year',
          'genre',
          'price',
          'in_stock',
        ],
      },
    },
  },
  required: ['books'],
};

// Complex e-commerce order schema
export const orderSchema = s.object({
  order_id: s.string(),
  customer: s.object({
    name: s.string(),
    email: s.string(),
    address: s.object({
      street: s.string(),
      city: s.string(),
      state: s.string(),
      zip_code: s.string(),
      country: s.string(),
    }),
  }),
  order_date: s.string(),
  status: s.string(),
  items: s.array(
    s.object({
      product_id: s.string(),
      name: s.string(),
      category: s.string(),
      price: s.number(),
      quantity: s.number(),
      discount_percent: s.number(),
      subtotal: s.number(),
    })
  ),
  payment: s.object({
    method: s.string(),
    transaction_id: s.string(),
    billing_address: s.object({
      street: s.string(),
      city: s.string(),
      state: s.string(),
      zip_code: s.string(),
      country: s.string(),
    }),
  }),
  shipping: s.object({
    carrier: s.string(),
    tracking_number: s.string(),
    estimated_delivery: s.string(),
    shipping_cost: s.number(),
  }),
  total_amount: s.number(),
  tax_amount: s.number(),
  discount_amount: s.number(),
});

export type OrderType = Infer<typeof orderSchema>;

export const orderJsonSchema = {
  type: 'object',
  properties: {
    order_id: { type: 'string' },
    customer: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip_code: { type: 'string' },
            country: { type: 'string' },
          },
          required: ['street', 'city', 'state', 'zip_code', 'country'],
        },
      },
      required: ['name', 'email', 'address'],
    },
    order_date: { type: 'string' },
    status: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          product_id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number' },
          discount_percent: { type: 'number' },
          subtotal: { type: 'number' },
        },
        required: [
          'product_id',
          'name',
          'category',
          'price',
          'quantity',
          'discount_percent',
          'subtotal',
        ],
      },
    },
    payment: {
      type: 'object',
      properties: {
        method: { type: 'string' },
        transaction_id: { type: 'string' },
        billing_address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip_code: { type: 'string' },
            country: { type: 'string' },
          },
          required: ['street', 'city', 'state', 'zip_code', 'country'],
        },
      },
      required: ['method', 'transaction_id', 'billing_address'],
    },
    shipping: {
      type: 'object',
      properties: {
        carrier: { type: 'string' },
        tracking_number: { type: 'string' },
        estimated_delivery: { type: 'string' },
        shipping_cost: { type: 'number' },
      },
      required: [
        'carrier',
        'tracking_number',
        'estimated_delivery',
        'shipping_cost',
      ],
    },
    total_amount: { type: 'number' },
    tax_amount: { type: 'number' },
    discount_amount: { type: 'number' },
  },
  required: [
    'order_id',
    'customer',
    'order_date',
    'status',
    'items',
    'payment',
    'shipping',
    'total_amount',
    'tax_amount',
    'discount_amount',
  ],
};

// User profile schema with validation hints
export const userProfileSchema = s.object({
  id: s.string().validate(value => value.length >= 3),
  username: s
    .string()
    .validate(value => value.length >= 2 && value.length <= 20),
  email: s
    .string()
    .validate(value => value.includes('@') && value.includes('.')),
  age: s.number().validate(value => value >= 13 && value <= 120),
  isActive: s.boolean().validate(value => value === true || value === false),
  roles: s.array(s.string()).validate(arr => arr.length >= 1),
  profile: s.object({
    firstName: s.string().validate(value => value.length >= 1),
    lastName: s.string().validate(value => value.length >= 1),
    bio: s.string().validate(value => value.length <= 500),
    website: s
      .string()
      .validate(
        value => value.startsWith('https://') || value.startsWith('http://')
      ),
  }),
  preferences: s.object({
    theme: s
      .string()
      .validate(value => ['light', 'dark', 'auto'].includes(value)),
    language: s.string().validate(value => value.length === 2),
    notifications: s.boolean(),
  }),
  createdAt: s.string().validate(value => value.includes('-')),
  lastLogin: s.string().validate(value => value.includes('-')),
});

export type UserProfileType = Infer<typeof userProfileSchema>;

export const userProfileJsonSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 3 },
    username: { type: 'string', minLength: 2, maxLength: 20 },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', minimum: 13, maximum: 120 },
    isActive: { type: 'boolean' },
    roles: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    profile: {
      type: 'object',
      properties: {
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        bio: { type: 'string', maxLength: 500 },
        website: { type: 'string', format: 'uri' },
      },
      required: ['firstName', 'lastName', 'bio', 'website'],
    },
    preferences: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark', 'auto'] },
        language: { type: 'string', minLength: 2, maxLength: 2 },
        notifications: { type: 'boolean' },
      },
      required: ['theme', 'language', 'notifications'],
    },
    createdAt: { type: 'string', format: 'date-time' },
    lastLogin: { type: 'string', format: 'date-time' },
  },
  required: [
    'id',
    'username',
    'email',
    'age',
    'isActive',
    'roles',
    'profile',
    'preferences',
    'createdAt',
    'lastLogin',
  ],
};
