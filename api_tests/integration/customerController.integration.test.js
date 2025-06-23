const { setupTestDB, teardownTestDB, clearTestDB } = require('../setup/database');
const { createUser, getCustomer, customerupdate, customerDelete } = require('../../controller.js');
const customerModel = require('../../customerModel.js');

describe('Customer Controller Integration Tests', () => {
  let req, res;

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
    
    // Mock request and response objects
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('createUser Integration', () => {
    test('should create a customer in the database', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      // Act
      await createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer Has Been Added",
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25
        }
      });

      // Verify customer was actually saved to database
      const savedCustomer = await customerModel.findOne({ email: 'john@example.com' });
      expect(savedCustomer).toBeTruthy();
      expect(savedCustomer.name).toBe('John Doe');
      expect(savedCustomer.age).toBe(25);
    });

    test('should prevent duplicate email addresses', async () => {
      // Arrange - Create first customer
      const customer1 = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      await customer1.save();

      // Try to create another customer with same email
      req.body = {
        name: 'Jane Doe',
        email: 'john@example.com',
        age: 30
      };

      // Act
      await createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "You Already Exist Edit your details"
      });

      // Verify only one customer exists
      const customers = await customerModel.find({ email: 'john@example.com' });
      expect(customers).toHaveLength(1);
      expect(customers[0].name).toBe('John Doe'); // Original customer unchanged
    });
  });

  describe('getCustomer Integration', () => {
    test('should retrieve all customers from database', async () => {
      // Arrange - Create test customers
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

      // Act
      await getCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.success).toBe(true);
      expect(responseCall.message).toBe("Customer are this");
      expect(responseCall.count).toBe(2);
      expect(responseCall.customers).toHaveLength(2);
      
      // Check if customers are returned correctly
      const customerNames = responseCall.customers.map(c => c.name);
      expect(customerNames).toContain('John Doe');
      expect(customerNames).toContain('Jane Smith');
    });

    test('should return empty array when no customers exist', async () => {
      // Act
      await getCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.count).toBe(0);
      expect(responseCall.customers).toEqual([]);
    });
  });

  describe('customerupdate Integration', () => {
    test('should update customer in database', async () => {
      // Arrange - Create a customer first
      const customer = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      await customer.save();

      req.params = { id: customer._id.toString() };
      req.body = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        age: 26
      };

      // Act
      await customerupdate(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "customer updated",
        details: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          age: 26
        }
      });

      // Verify customer was actually updated in database
      const updatedCustomer = await customerModel.findById(customer._id);
      expect(updatedCustomer.name).toBe('John Updated');
      expect(updatedCustomer.email).toBe('john.updated@example.com');
      expect(updatedCustomer.age).toBe(26);
    });
  });

  describe('customerDelete Integration', () => {
    test('should delete customer from database', async () => {
      // Arrange - Create a customer first
      const customer = new customerModel({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
      await customer.save();

      req.params = { id: customer._id.toString() };

      // Act
      await customerDelete(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer Deleted",
        deleted: {
          name: 'John Doe'
        }
      });

      // Verify customer was actually deleted from database
      const deletedCustomer = await customerModel.findById(customer._id);
      expect(deletedCustomer).toBeNull();
    });
  });
});