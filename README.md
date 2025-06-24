# Keploy API Server 

A simple REST API server built with **Node.js**, **Express**, and **MySQL**. 

This project was created as part of a hands-on learning assignment to understand how to build and test custom APIs with database integration. It also includes **Keploy** for test automation.

---

##  Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **API Testing**: Postman (development), Automated tests (CI/CD)

---

## API Overview

| Method | Endpoint        | Description         |
|--------|------------------|---------------------|
| GET    | `/get`           | Get all users       |
| POST   | `/post`          | Add a new user      |
| PUT    | `/update/:id`    | Update user by ID   |
| DELETE | `/delete/:id`    | Delete user by ID   |

### Sample POST Request

```bash
POST /api/customers
Content-Type: application/json

{
  "name": "Shravya",
  "email": "example@email.com",
  "age": 21
}
```

---

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shravya33/Keploy-api_server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=url
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000`

---

## Testing

This project includes a comprehensive testing suite with three types of tests:

### Testing Frameworks Used

- **Jest**: Main testing framework
- **Supertest**: HTTP testing library
- **MongoDB Memory Server**: In-memory MongoDB for testing

### Test Types

### 1. Unit Tests
Test individual functions in isolation with mocked dependencies.

```bash
npm run test:unit
```

**Location**: `tests/unit/`

**Coverage**: Tests controller logic with mocked database operations

### 2. Integration Tests
Test the interaction between controllers and the database.

```bash
npm run test:integration
```

**Location**: `tests/integration/`

**Coverage**: Tests controller + database integration with real (in-memory) MongoDB

### 3. API Tests
Test HTTP endpoints as a client would use them.

```bash
npm run test:api
```

**Location**: `tests/api/`

**Coverage**: Tests complete HTTP request/response cycle

