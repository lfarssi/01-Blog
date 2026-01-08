# Blog API Documentation

## Overview
A complete REST API for a blog platform with authentication, blogs, comments, and likes functionality.

## Base URL
All endpoints are prefixed with `/api` (configured in application.properties)

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Endpoints

### Authentication

#### Register User
- **POST** `/users/register`
- **Public endpoint**
- **Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
- **POST** `/auth/login`
- **Public endpoint**
- **Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response:**
```json
{
  "token": "jwt_token_here"
}
```

### Users

#### Get User Profile
- **GET** `/users/{username}`
- **Public endpoint**
- **Response:**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "role": "user",
  "banned": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Blogs

#### Get All Blogs
- **GET** `/blogs`
- **Public endpoint**
- **Response:** Array of blog objects

#### Get Blog by ID
- **GET** `/blogs/{id}`
- **Public endpoint**
- **Response:**
```json
{
  "id": 1,
  "title": "string",
  "content": "string",
  "media": "string",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Get Blogs by User
- **GET** `/blogs/user/{username}`
- **Public endpoint**
- **Response:** Array of blog objects

#### Create Blog
- **POST** `/blogs`
- **Requires authentication**
- **Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "media": "string"
}
```

#### Update Blog
- **PUT** `/blogs/{id}`
- **Requires authentication**
- **Only blog owner can update**
- **Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "media": "string"
}
```

#### Delete Blog
- **DELETE** `/blogs/{id}`
- **Requires authentication**
- **Only blog owner can delete**

### Comments

#### Get Comments for Blog
- **GET** `/comments/blogs/{blogId}`
- **Public endpoint**
- **Response:**
```json
[
  {
    "id": 1,
    "blogId": 1,
    "userId": 1,
    "username": "string",
    "content": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Comment
- **POST** `/comments/blogs/{blogId}`
- **Requires authentication**
- **Request Body:**
```json
{
  "content": "string"
}
```

#### Delete Comment
- **DELETE** `/comments/{commentId}`
- **Requires authentication**
- **Only comment owner can delete**

### Likes

#### Get Like Status
- **GET** `/likes/blogs/{blogId}`
- **Requires authentication**
- **Response:**
```json
{
  "liked": true,
  "likeCount": 42
}
```

#### Toggle Like
- **POST** `/likes/blogs/{blogId}`
- **Requires authentication**
- **Response:**
```json
{
  "liked": true,
  "likeCount": 43
}
```

---

## Features Implemented

### Security
- JWT-based authentication
- Password encryption using BCrypt
- Role-based authorization
- Session stateless (REST API)
- Public GET endpoints for blogs and comments
- Protected endpoints for create/update/delete operations

### Blog Management
- Full CRUD operations (Create, Read, Update, Delete)
- List all blogs
- Get blogs by specific user
- Automatic tracking of like and comment counts
- Media support

### Comment System
- Create comments on blogs
- View all comments for a blog
- Delete own comments
- Automatic comment count updates on blogs
- Shows username with each comment

### Like System
- Toggle like/unlike on blogs
- Check like status
- Get total like count
- Prevents duplicate likes
- Automatic like count updates on blogs

### Data Validation
- Owner verification for updates and deletes
- User authentication checks
- Resource existence validation

---

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Encrypted)
- role (default: "user")
- banned (default: false)
- createdAt

### Blogs Table
- id (Primary Key)
- title
- content
- user_id (Foreign Key to Users)
- media
- like_count
- comment_count
- createdAt
- updatedAt

### Comments Table
- id (Primary Key)
- blog_id (Foreign Key to Blogs)
- user_id (Foreign Key to Users)
- content
- createdAt
- updatedAt

### Likes Table
- id (Primary Key)
- blog_id (Foreign Key to Blogs)
- user_id (Foreign Key to Users)
- createdAt
- updatedAt

---

## Running the Application

1. Ensure PostgreSQL is running (using docker-compose):
   ```bash
   docker-compose up -d
   ```

2. Build the application:
   ```bash
   cd backend
   ./mvnw clean install
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

4. The API will be available at `http://localhost:8080/api`

---

## Technologies Used
- Spring Boot 4.0.0
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Lombok
- Maven
