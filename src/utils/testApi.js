const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test function
const testApi = async () => {
  try {
    console.log('Testing API...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('Health endpoint response:', healthResponse.data);
    
    // Test login (assuming admin user exists)
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Login response:', loginResponse.data);
    
    // Set token for authenticated requests
    const token = loginResponse.data.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    // Test creating a product
    console.log('\n3. Testing product creation...');
    const productData = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 9.99,
      category: 'Test Category',
      unit: 'piece',
      maxQuantity: 10,
      imageUrl: 'https://res.cloudinary.com/dmwwhnvha/image/upload/v1741100806/student_photos/rtkvf25eietcvrjttw5d.jpg'
    };
    
    const productResponse = await axios.post(`${API_URL}/products`, productData, config);
    console.log('Product creation response:', productResponse.data);
    
    const productId = productResponse.data.data._id;
    
    // Test getting products
    console.log('\n4. Testing get products...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    console.log('Products response:', productsResponse.data);
    
    // Test customer session
    console.log('\n5. Testing customer session...');
    const sessionResponse = await axios.post(`${API_URL}/customer/session`, {
      customerName: 'Test Customer'
    });
    console.log('Customer session response:', sessionResponse.data);
    
    // Test creating an order
    console.log('\n6. Testing order creation...');
    const orderData = {
      customerName: 'Test Customer',
      items: [
        {
          product: productId,
          quantity: 2
        }
      ]
    };
    
    // Set cookie for customer session
    const orderConfig = {
      headers: {
        Cookie: `customerSession=${sessionResponse.data.data.token}`
      },
      withCredentials: true
    };
    
    const orderResponse = await axios.post(`${API_URL}/orders`, orderData, orderConfig);
    console.log('Order creation response:', orderResponse.data);
    
    // Test getting orders
    console.log('\n7. Testing get orders...');
    const ordersResponse = await axios.get(`${API_URL}/orders`, config);
    console.log('Orders response:', ordersResponse.data);
    
    // Test updating order status
    console.log('\n8. Testing update order status...');
    const orderId = orderResponse.data.data._id;
    const statusResponse = await axios.put(`${API_URL}/orders/${orderId}/status`, {
      status: 'preparing'
    }, config);
    console.log('Status update response:', statusResponse.data);
    
    // Test deleting product
    console.log('\n9. Testing delete product...');
    const deleteResponse = await axios.delete(`${API_URL}/products/${productId}`, config);
    console.log('Delete product response:', deleteResponse.data);
    
    console.log('\nAPI tests completed successfully!');
  } catch (error) {
    console.error('API test error:', error.response ? error.response.data : error.message);
  }
};

// Run tests
testApi(); 







