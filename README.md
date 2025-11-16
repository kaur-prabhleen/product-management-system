# Product Management System

This project implements:
- Angular frontend
- Node.js (Express) backend
- MySQL (via Sequelize) RDBMS
- RabbitMQ worker for bulk upload processing
- Postman collection for API testing

## Quick start (development)
1. Backend
   ```bash
   cd backend
   cp .env.example .env
   # update DB credentials and JWT secret
   npm install
   npm run dev
   
2. Frontend
      ```bash
   cd frontend
   npm install
   npm start


Important notes
  Each record uses a numeric primary key for internal references and an auto-generated UUID as an external unique identifier for APIs.
  Bulk CSV uploads are queued using RabbitMQ to avoid HTTP timeouts.
  Job status JSONs live in backend/jobs/ and uploaded CSVs are in backend/uploads/.
  
What I implemented
  ✔ User CRUD
  
      - Register/Login
      - Passwords encrypted using bcrypt
      - JWT-based authentication

  ✔ Category CRUD
  
      - Category Name + Auto-generated UUID
      - Fully relational

  ✔ Product CRUD
  
      - Product Name, Image, Price
      - Belongs to a Category
      - UUID-based public IDs

  ✔ Bulk Upload System
  
      - CSV parsed using fast-csv
      - RabbitMQ queue for background processing
      - Worker does batch inserts (100 rows per batch)
      - Frontend job status polling

  ✔ Reports
  
      - List upload jobs
      - Download uploaded CSVs
      - Export products report

  ✔ Product Listing
  
      - Server-side pagination
      - Sorting by price (asc/desc)
      - Search by category or product name

How to test
   ```bash

  Import Postman collection (file: postman/ProductManagement.postman_collection.json)
  Set environment variable {{base_url}} = http://localhost:5000
  For authenticated endpoints: POST /api/auth/login → get token → set {{jwt}} = <token> as Bearer (or save it in Postman env)
  Authenticate
      Call: POST /api/auth/login
      Copy the JWT from the response
      Paste into Postman environment variable jwt
  Postman Authorization
      Go to your collection → Authorization tab:
        Type: Bearer Token
        Token: {{jwt}}


## Postman Collection
A complete Postman collection is included for API testing.
 **Download here:**  (https://github.com/kaur-prabhleen/product-management-system/blob/main/postman/Product%20Management%20System.postman_collection.json)
[Postman Collection](postman/ProductManagement.postman_collection.json)
