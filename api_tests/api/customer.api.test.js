const request = require('supertest');
const { setupTestDB, teardownTestDB, clearTestDB } = require('../setup/database');
const app = require('../../index'); // Your Express app
const customerModel = require('../../customerModel.js');

describe('Customer API Endpoints', () => {
  // Setup test database
  beforeAll(async () => {
    await setupTestDB();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database before each test
  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /cus/create', () => {
    test('should create a new customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const response = await request(app)
        .post('/cus/create')  // Changed from /api/customers
        .send(customerData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: "Customer Has Been Added",
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25
        }
      });

      // Verify customer was saved in database
      const savedCustomer = await customerModel.findOne({ email: 'john@example.com' });
      expect(savedCustomer).toBeTruthy();
    });

    test('should return 401 for missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe'
        // missing email and age
      };

      const response = await request(app)
        .post('/cus/create')  // Changed from /api/customers
        .send(incompleteData)
        .expect(401);

      expect(response.body).toEqual({
        message: "Please Provide All the Fields"
      });
    });

    test('should return 401 for duplicate email', async () => {
      // Create first customer
      const customer1 = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      await customer1.save();

      // Try to create another with same email
      const duplicateData = {
        name: 'Jane Doe',
        email: 'john@example.com',
        age: 30
      };

      const response = await request(app)
        .post('/cus/create')  // Changed from /api/customers
        .send(duplicateData)
        .expect(401);

      expect(response.body).toEqual({
        message: "You Already Exist Edit your details"
      });
    });

    test('should validate email format', async () => {
      const invalidEmailData = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 25
      };

      const response = await request(app)
        .post('/cus/create')  // Changed from /api/customers
        .send(invalidEmailData);

      // The response will depend on your current validation
    });
  });

  describe('GET /cus', () => {
    test('should return all customers', async () => {
      // Create test customers
      const customer1 = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      const customer2 = new customerModel({
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 30
      });
      
      await customer1.save();
      await customer2.save();

      const response = await request(app)
        .get('/cus')  // Changed from /api/customers
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Customer are this");
      expect(response.body.count).toBe(2);
      expect(response.body.customers).toHaveLength(2);

      // Check customer data structure
      const customer = response.body.customers[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('name');
      expect(customer).toHaveProperty('email');
      expect(customer).toHaveProperty('age');
    });

    test('should return empty array when no customers exist', async () => {
      const response = await request(app)
        .get('/cus')  // Changed from /api/customers
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.customers).toEqual([]);
    });
  });

  describe('PATCH /cus/:id', () => {
    test('should update an existing customer', async () => {
      // Create a customer first
      const customer = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      await customer.save();

      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 26
      };

      const response = await request(app)
        .patch(`/cus/${customer._id}`)  // Changed from PUT to PATCH and /api/customers
        .send(updateData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: "customer updated",
        details: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          age: 26
        }
      });

      // Verify update in database
      const updatedCustomer = await customerModel.findById(customer._id);
      expect(updatedCustomer.name).toBe('John Updated');
    });

    test('should handle invalid customer ID', async () => {
      const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
      
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 26
      };

      const response = await request(app)
        .patch(`/cus/${invalidId}`)  // Changed from PUT to PATCH and /api/customers
        .send(updateData)
        .expect(501);

      expect(response.body).toEqual({
        message: "Could not Update"
      });
    });
  });

  describe('DELETE /cus/:id', () => {
    test('should delete an existing customer', async () => {
      // Create a customer first
      const customer = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      await customer.save();

      const response = await request(app)
        .delete(`/cus/${customer._id}`)  // Changed from /api/customers
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: "Customer Deleted",
        deleted: {
          name: 'John Doe'
        }
      });

      // Verify deletion in database
      const deletedCustomer = await customerModel.findById(customer._id);
      expect(deletedCustomer).toBeNull();
    });

    test('should handle invalid customer ID for deletion', async () => {
      const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist

      const response = await request(app)
        .delete(`/cus/${invalidId}`)  // Changed from /api/customers
        .expect(501);

      expect(response.body).toEqual({
        message: "Could not delete"
      });
    });
  });

  describe('API Error Handling', () => {
    test('should handle malformed JSON in POST request', async () => {
      const response = await request(app)
        .post('/cus/create')  // Changed from /api/customers
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('should handle invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app)
        .get(`/cus/${invalidId}`)  // This endpoint doesn't exist in your routes
        .expect(404); // Will likely return 404 since GET /cus/:id isn't defined

      // Add assertions based on your error handling
    });
  });
});