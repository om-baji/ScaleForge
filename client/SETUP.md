# Frontend Setup Instructions

This document provides setup instructions for the frontend application with AWS Cognito authentication and backend integration.

## Environment Configuration

Create a `.env.local` file in the client directory with the following variables:

```bash
# AWS Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=your_user_pool_id_here
NEXT_PUBLIC_CLIENT_ID=your_client_id_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_ORDER_API_BASE_URL=http://localhost:5000
```

## AWS Cognito Setup

1. **Create a User Pool:**
   - Go to AWS Cognito Console
   - Create a new User Pool
   - Configure authentication settings
   - Note down the User Pool ID and Client ID

2. **Configure User Pool Settings:**
   - Enable email as username or allow username
   - Set password requirements (minimum 8 characters)
   - Configure MFA if needed
   - Set up email verification

3. **Create an App Client:**
   - In your User Pool, create an App Client
   - Enable "Generate client secret" if needed
   - Configure authentication flows (ALLOW_USER_SRP_AUTH, ALLOW_REFRESH_TOKEN_AUTH)

## Backend Services

Ensure the following services are running:

1. **Inventory Service** - Port 4000
   - Endpoints: `/api/v1/inventory/*`
   - Handles product management and stock operations

2. **Order Service** - Port 5000
   - Endpoints: `/api/v1/order/*`
   - Handles order creation, status updates, and user orders

## Frontend Features

### Authentication
- **Login/Signup** - AWS Cognito integration
- **Protected Routes** - Automatic redirect to login for unauthenticated users
- **User Context** - Global authentication state management
- **Logout** - Secure logout with token cleanup

### API Integration
- **Inventory API** - Product management, stock updates, low stock alerts
- **Orders API** - Order creation, status management, user order history
- **Authentication Headers** - Automatic JWT token inclusion in API requests

### Key Components
- `AuthProvider` - Global authentication context
- `ProtectedRoute` - Route protection wrapper
- `useAuth` - Authentication hook
- `useProducts` - Inventory management hook
- `useOrdersByUser` - User-specific orders hook

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## API Endpoints

### Inventory Service (Port 4000)
- `GET /api/v1/inventory/products` - Get all products
- `POST /api/v1/inventory/products` - Create product
- `GET /api/v1/inventory/products/:id` - Get product by ID
- `PUT /api/v1/inventory/products/:id` - Update product
- `DELETE /api/v1/inventory/products/:id` - Delete product
- `GET /api/v1/inventory/products/low-stock` - Get low stock products
- `PATCH /api/v1/inventory/products/stock/bulk-update` - Bulk update stock

### Order Service (Port 5000)
- `POST /api/v1/order` - Create order
- `GET /api/v1/order/:id` - Get order by ID
- `GET /api/v1/order/user/:id` - Get user orders
- `PATCH /api/v1/order/:id/status` - Update order status
- `PATCH /api/v1/order/:id/cancel` - Cancel order

## Data Models

### Product
```typescript
interface Product {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  stock: number
  createdAt?: string
  updatedAt?: string
}
```

### Order
```typescript
interface Order {
  id: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELED"
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}
```

## Troubleshooting

1. **Authentication Issues:**
   - Verify Cognito User Pool ID and Client ID
   - Check that CORS is configured for your domain
   - Ensure JWT tokens are being stored in localStorage

2. **API Connection Issues:**
   - Verify backend services are running on correct ports
   - Check API base URLs in environment variables
   - Ensure authentication headers are being sent

3. **Build Issues:**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
