# Shop Management System - Backend

This is the backend API for the Shop Management System, built with Node.js, Express, and MongoDB.

## Features

- User authentication (admin/staff)
- Product management (CRUD operations)
- Order management
- Customer session management
- Image upload with Cloudinary
- Advanced filtering, sorting, and pagination
- Order analytics

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=http://localhost:3000
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (admin only)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products (with filtering, sorting, pagination)
- `GET /api/products/categories` - Get all product categories
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders (authenticated users only)
- `GET /api/orders/analytics` - Get order analytics (admin only)
- `GET /api/orders/:id` - Get order by ID (authenticated users only)
- `PUT /api/orders/:id/status` - Update order status (authenticated users only)

### Customer Session

- `POST /api/customer/session` - Create customer session
- `GET /api/customer/session` - Get current customer session
- `DELETE /api/customer/session` - Clear customer session

## Deployment

This backend is designed to be deployed on Render. Make sure to set all the environment variables in the Render dashboard. 

## Project Preview

<table>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (283).png" alt="Admin" width="800" height="400"></td>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (281).png" alt="Admin" width="800" height="400"></td>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (277).png" alt="Landing" width="800" height="400"></td>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (278).png" alt="Admin" width="800" height="400"></td>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (279).png" alt="Admin" width="800" height="400"></td>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (280).png" alt="Admin" width="800" height="400"></td>
  </tr>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (282).png" alt="Admin" width="800" height="400"></td>
  </tr>
  </tr>
   <tr>
    <td colspan="3"><img src="/screenshot/Screenshot (284).png" alt="Admin" width="800" height="400"></td>
  </tr>
    
 
</table>
