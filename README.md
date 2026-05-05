# 🚀 Team Task Manager

A full-stack **Task Management System** built with **Spring Boot + MySQL + JWT Authentication** and a simple frontend.  
This application allows teams to manage projects, assign tasks, track progress, and collaborate efficiently.

---

## 📌 Features

### 🔐 Authentication & Security
- User Signup & Login (JWT-based authentication)
- Secure password handling
- Role-based access (Admin/User)

### 📁 Project Management
- Create, update, delete projects
- Assign project members
- Track project status

### ✅ Task Management
- Create and assign tasks
- Set priority & deadlines
- Update task status (TODO / IN PROGRESS / DONE)
- Track overdue tasks

### 📊 Dashboard
- Task statistics (Total, Completed, Pending, Overdue)
- Recent activity tracking

---

## 🛠️ Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA (Hibernate)
- JWT Authentication

### Frontend
- HTML, CSS, JavaScript (Vanilla JS)

### Database
- MySQL (Railway Cloud DB)

### Deployment
- Railway (Backend + Database)

---

## 📂 Project Structure

team-task-manager/
│
├── backend/
│ ├── controller/
│ ├── service/
│ ├── repository/
│ ├── entity/
│ ├── dto/
│ ├── config/
│ └── exception/
│
├── frontend/
│ ├── index.html
│ ├── pages/
│ ├── css/
│ └── js/
│
└── README.md




---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager

Backend Setup
Configure Database (application.properties)
spring.datasource.url=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}
spring.datasource.username=${MYSQLUSER}
spring.datasource.password=${MYSQLPASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=${PORT:8080}
3️⃣ Run Backend
mvn clean install
mvn spring-boot:run

Backend will run on:

http://localhost:8080
4️⃣ Frontend Setup

Update API base URL in api.js:

const API_BASE = 'http://localhost:8080/api';

Open:

index.html
🌐 Deployment (Railway)
Steps:
Push code to GitHub
Go to Railway
Create new project → Deploy from GitHub
Add MySQL database
Set environment variables:
MYSQLHOST
MYSQLPORT
MYSQLDATABASE
MYSQLUSER
MYSQLPASSWORD
Update frontend API:
const API_BASE = 'https://your-app.up.railway.app/api';
🔗 API Endpoints
Auth
POST /api/auth/signup
POST /api/auth/login
Projects
GET    /api/projects
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
Tasks
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
PATCH  /api/tasks/{id}/status
DELETE /api/tasks/{id}
