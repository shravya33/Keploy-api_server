const { createUser, getCustomer, customerupdate, customerDelete } = require('../../controller.js');
const customerModel = require('../../customerModel.js');

// Mock the customer model
jest.mock('../../customerModel');

describe('Customer Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('should create a new customer successfully', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const mockCustomer = {
        _id: 'mock-id',
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        save: jest.fn().mockResolvedValue(true)
      };

      customerModel.findOne.mockResolvedValue(null); // No existing customer
      customerModel.mockImplementation(() => mockCustomer);

      // Act
      await createUser(req, res);

      // Assert
      expect(customerModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockCustomer.save).toHaveBeenCalled();
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
    });

    test('should return 401 when required fields are missing', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        // email and age missing
      };

      // Act
      await createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please Provide All the Fields"
      });
      expect(customerModel.findOne).not.toHaveBeenCalled();
    });

    test('should return 401 when customer already exists', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const existingCustomer = {
        _id: 'existing-id',
        email: 'john@example.com'
      };

      customerModel.findOne.mockResolvedValue(existingCustomer);

      // Act
      await createUser(req, res);

      // Assert
      expect(customerModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "You Already Exist Edit your details"
      });
    });

    test('should handle database errors', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      customerModel.findOne.mockRejectedValue(new Error('Database error'));

      // Act
      await createUser(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        message: "Could Not create a user"
      });
    });
  });

  describe('getCustomer', () => {
    test('should return all customers successfully', async () => {
      // Arrange
      const mockCustomers = [
        { _id: '1', name: 'John', email: 'john@example.com', age: 25 },
        { _id: '2', name: 'Jane', email: 'jane@example.com', age: 30 }
      ];

      customerModel.find.mockResolvedValue(mockCustomers);

      // Act
      await getCustomer(req, res);

      // Assert
      expect(customerModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer are this",
        count: 2,
        customers: [
          { id: '1', name: 'John', email: 'john@example.com', age: 25 },
          { id: '2', name: 'Jane', email: 'jane@example.com', age: 30 }
        ]
      });
    });

    test('should handle database errors when getting customers', async () => {
      // Arrange
      customerModel.find.mockRejectedValue(new Error('Database error'));

      // Act
      await getCustomer(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        message: "Get User Could not be fullfilled"
      });
    });
  });

  describe('customerupdate', () => {
    test('should update customer successfully', async () => {
      // Arrange
      req.params = { id: 'customer-id' };
      req.body = {
        name: 'Updated Name',
        email: 'updated@example.com',
        age: 30
      };

      const updatedCustomer = {
        _id: 'customer-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        age: 30
      };

      customerModel.findByIdAndUpdate.mockResolvedValue(updatedCustomer);

      // Act
      await customerupdate(req, res);

      // Assert
      expect(customerModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'customer-id',
        {
          name: 'Updated Name',
          email: 'updated@example.com',
          age: 30
        },
        {
          new: true,
          runValidators: true
        }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "customer updated",
        details: {
          name: 'Updated Name',
          email: 'updated@example.com',
          age: 30
        }
      });
    });

    test('should handle update errors', async () => {
      // Arrange
      req.params = { id: 'customer-id' };
      req.body = { name: 'Updated Name', email: 'updated@example.com', age: 30 };

      customerModel.findByIdAndUpdate.mockRejectedValue(new Error('Update error'));

      // Act
      await customerupdate(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        message: "Could not Update"
      });
    });
  });

  describe('customerDelete', () => {
    test('should delete customer successfully', async () => {
      // Arrange
      req.params = { id: 'customer-id' };

      const deletedCustomer = {
        _id: 'customer-id',
        name: 'John Doe'
      };

      customerModel.findByIdAndDelete.mockResolvedValue(deletedCustomer);

      // Act
      await customerDelete(req, res);

      // Assert
      expect(customerModel.findByIdAndDelete).toHaveBeenCalledWith('customer-id');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer Deleted",
        deleted: {
          name: 'John Doe'
        }
      });
    });

    test('should handle delete errors', async () => {
      // Arrange
      req.params = { id: 'customer-id' };

      customerModel.findByIdAndDelete.mockRejectedValue(new Error('Delete error'));

      // Act
      await customerDelete(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(501);
      expect(res.json).toHaveBeenCalledWith({
        message: "Could not delete"
      });
    });
  });
});