/**
 * Application wide configuration
 */
const config = {
  baseURI: process.env.REACT_APP_API_BASE_URL,
  apiEndPoint: {
    product: {
      fetchProducts: '/api/v1/product',
      fetchProduct: '/api/v1/product/:id',
      fetchProductReviews: '/api/v1/product/:id/reviews',
      createReview: '/api/v1/product/:id/reviews',
      deleteProduct: '/api/v1/product/:id',
      createProduct: '/api/v1/product',
      updateProduct: '/api/v1/product/:id',
    },
    user: {
      login: '/api/v1/auth/login',
      create: '/api/v1/auth/register',
      fetchUsers: '/api/v1/user',
      verifyEmail: '/api/v1/auth/verify-email',
      deleteUser: '/api/v1/user/:id',
      updateUser: '/api/v1/user/:id',
      fetchUser: '/api/v1/user/:id',
      forgotPassword: '/api/v1/auth/forgot-password',
      resetPassword: '/api/v1/auth/reset-password',
    },
    order: {
      createOrder: '/api/v1/order',
      order: '/api/v1/order/:id',
      pay: '/api/v1/order/:id/pay',
      deliverOrder: '/api/v1/order/:id/deliver',
      userOrder: '/api/v1/order/auth-orders',
      orders: '/api/v1/order',
    },
  },
};

export default config;
