# TrueBond Matrimony API

A RESTful API for managing biodatas, users, premium membership, marriage stories, and payments using Node.js, Express, and MongoDB. This API is the backend for - https://truebond-matrimony.web.app/

## Overview

This API provides a set of routes for managing biodatas, users, marriage stories, contact requests, and premium requests, as well as handling Stripe payments. It supports JWT authentication and provides various data statistics.

## Base URL

https://truebond-matrimony.vercel.app/

## Technologies Used

- **Node.js**: JavaScript runtime for building the API.
- **TypeScript**: Superset of JavaScript for type safety.
- **Express**: Web framework for Node.js to handle routing and middleware.
- **MongoDB**: NoSQL database for data storage and retrieval.
- **Stripe**: Payment processing service.
- **JWT (JSON Web Token)**: For user authentication.
- **CORS**: Middleware to enable Cross-Origin Resource Sharing.

## Folder Structure

.
├── dist
│ ├── index.js
├── routes
│ ├── biodatas.routes.ts
│ ├── contact.routes.ts
│ ├── married.routes.ts
│ ├── premium.routes.ts
│ ├── users.routes.ts
├── interfaces
│ ├── biodata.interfaces.ts
│ ├── user.interfaces.ts
├── node_modules
├── package.json
├── package-lock.json
└── .env

## Endpoints

### 1. Biodatas

- **GET /biodatas**

  - Fetch all biodatas with optional filters.

  - **Query Parameters:**
    - `id`: Filter by biodata ID.
    - `premium`: Filter by premium status (returns all premium biodatas).
    - `email`: Filter by contact email.
    - `age`: Filter by age range (e.g., `25-30`).
    - `gender`: Filter by gender.
    - `division`: Filter by permanent division.
    - `search`: Search by name (case-insensitive).
    - `isPremium`: Filter by premium status (`true` or `false`).
    - `page`: Pagination (default is `1`).

- **POST /biodatas**

  - Create or update a biodata.
  - **Request Body:** `{ "biodataId": "number", "gender": "string", "name": "string", "profileImage": "string", "dob": "date", "height": "string", "weight": "string", "age": "number", "occupation": "string", "race": "string", "fathersName": "string", "mothersName": "string", "permanentDivision": "string", "presentDivision": "string", "expectedPartnerAge": "string", "expectedPartnerHeight": "string", "expectedPartnerWeight": "string", "contactEmail": "string", "mobileNumber": "string", "premium": "boolean" }`

- **PATCH /biodatas/premium/:email**
  - Upgrade a biodata to premium.
  - **Request Body:** `{ "biodataId": "number", "email": "string", "name": "string" }`
  - **URL Parameter:** `email`: Email of the biodata to be upgraded.

### 2. Users

- **GET /users**

  - Fetch all users or a specific user by email.

  - **Query Parameters:**
    - `email`: Filter by user email.

- **POST /users**

  - Create a new user.
  - **Request Body:** `{ "email": "string", "name": "string" }`

- **PATCH /users/admin/:email**
  - Make a user an admin.
  - **URL Parameter:** `email`: Email of the user to be made an admin.

### 3. Marriage Stories

- **GET /marriedstory**

  - Fetch all marriage stories.

- **POST /marriedstory**
  - Add a new marriage story.
  - **Request Body:** `{ "title": "string", "content": "string", "date": "date" }`

### 4. Contact Requests

- **GET /contactrequests**

  - Fetch all contact requests or filter by requester email.

  - **Query Parameters:**
    - `email`: Filter by requester email.

- **POST /contactrequests**

  - Add a new contact request.
  - **Request Body:** `{ "requesterEmail": "string", "biodataId": "number", "name": "string", "contactEmail": "string", "mobileNumber": "string", "status": "pending" }`

- **PATCH /contactrequests/approve/:id**

  - Approve a contact request.
  - **URL Parameter:** `id`: ID of the contact request.

- **DELETE /contactrequests/delete/:id**
  - Delete a contact request.
  - **URL Parameter:** `id`: ID of the contact request.

### 5. Premium Requests

- **GET /premiumrequests**

  - Fetch all premium requests.

- **POST /premiumrequests**
  - Add a new premium request.
  - **Request Body:** `{ "biodataId": "number", "email": "string", "name": "string"}`

### 6. Payment Intent

- **POST /create-payment-intent**
  - Create a payment intent for Stripe.
  - **Request Body:** `{ "price": "number" }`

### 7. Statistics

- **GET /stats**
  - Fetch statistics related to biodatas, premium users, and revenue.

### 8. Revenue

- **PATCH /revenue**
  - Increment revenue.

## License

This project is licensed under the MIT License.
