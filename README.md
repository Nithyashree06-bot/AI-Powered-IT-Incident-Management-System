# IncidentIQ — AI-Powered IT Incident Management System

> **Raise it. Classify it. Resolve it. Automatically.**  
> **Team Pivot 4** | J.J. College of Engineering and Technology | Java Full Stack — HCL Campus Hire

---

## 📌 Project Overview
Large enterprise IT departments handle hundreds of daily incidents—network failures, server outages, access issues, and software bugs. Manual triage causes delayed response times, SLA breaches, and overworked helpdesks.

**IncidentIQ** streamlines this entire lifecycle by integrating Google Gemini AI to auto-classify incident severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), detect category (`Network`, `Hardware`, `Software`, `Security`), auto-assign to relevant teams, calculate SLA countdowns, and generate step-by-step troubleshooting recommendations in real time.

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Java 17 + Spring Boot 3.2.x | Spring Security, Spring Data JPA, Hibernate, Maven |
| **Authentication** | JWT (JSON Web Tokens - JJWT) | Stateless authentication with RBAC (`EMPLOYEE`, `IT_STAFF`, `ADMIN`) |
| **Database** | MySQL 8.0 | Relational schema with 5 normalized tables + audit history |
| **AI Integration** | Google Gemini API (AI Studio) | Automated severity classification, categorization & self-service remediation |
| **Frontend** | React 18 + TypeScript | Vite, Tailwind CSS, Lucide Icons, Recharts |
| **API Docs** | SpringDoc OpenAPI / Swagger UI | Interactive REST documentation at `/swagger-ui.html` |
| **Testing** | JUnit 5 + Mockito + JaCoCo | >70% Line & Branch Coverage |
| **Deployment** | Docker & Docker Compose | Multi-container setup (MySQL 8, Spring Boot Backend, React Nginx Frontend) |

---

## 📁 Repository Structure

```
incidentiq/
├── backend/                  ← Spring Boot 3 + Java 17
│   ├── src/main/java/com/incidentiq/
│   │   ├── controller/       ← REST endpoints (@Tag, @Operation)
│   │   ├── service/          ← Business logic & Gemini AI client
│   │   ├── repository/       ← Spring Data JPA interfaces
│   │   ├── entity/           ← User, Ticket, Category, TicketComment, TicketHistory
│   │   ├── dto/              ← Request & Response DTOs with @Valid
│   │   ├── security/         ← JwtUtil, JwtAuthFilter, SecurityFilterChain
│   │   ├── config/           ← CorsConfig, OpenApiConfig
│   │   └── exception/        ← GlobalExceptionHandler (@ControllerAdvice)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql          ← Seed users, categories, and initial tickets
│   └── pom.xml               ← Maven build file
├── frontend/                 ← React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── pages/            ← LoginPage, TicketListPage, RaiseTicket, etc.
│   │   ├── components/       ← Navbar, Sidebar, TicketCard, SLA Countdown, AI Resolution Box
│   │   ├── services/         ← Axios instance with JWT interceptors
│   │   ├── context/          ← AuthContext (User state, roles, token)
│   │   ├── types/            ← Strict TypeScript interfaces
│   │   └── App.tsx           ← Client-side routing with ProtectedRoute
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml        ← Multi-container orchestration
└── README.md                 ← Project documentation & manual
```

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- **JDK 17+**
- **Node.js 18+** & **npm 9+**
- **MySQL 8.0**
- **Google Gemini API Key** (from Google AI Studio)

### 2. Backend Setup
1. Create MySQL Database:
   ```sql
   CREATE DATABASE incidentiq;
   ```
2. Configure credentials in `backend/src/main/resources/application.properties` or set environment variables:
   ```bash
   export DB_URL="jdbc:mysql://localhost:3306/incidentiq"
   export DB_USERNAME="root"
   export DB_PASSWORD="yourpassword"
   export JWT_SECRET="your_jwt_secret_key_minimum_32_chars_long_incidentiq"
   export GEMINI_API_KEY="your_actual_gemini_api_key"
   ```
3. Run Spring Boot application:
   ```bash
   cd incidentiq/backend
   ./mvnw spring-boot:run
   ```
   *Backend runs on `http://localhost:8080`*
   *Swagger documentation accessible at `http://localhost:8080/swagger-ui.html`*

### 3. Frontend Setup
1. Install dependencies:
   ```bash
   cd incidentiq/frontend
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
   *Frontend opens at `http://localhost:3000`*

### 4. Running with Docker Compose
To launch the complete system (MySQL, Spring Boot backend, and React frontend) in a single command:
```bash
docker-compose up --build
```

---

## 🔑 Default Credentials (Seed Data)

| Role | Email | Password | Department |
|---|---|---|---|
| **EMPLOYEE** | `employee@incidentiq.com` | `password123` | IT Department |
| **IT_STAFF** | `staff@incidentiq.com` | `password123` | Network Team |
| **ADMIN** | `admin@incidentiq.com` | `password123` | Management |

---

## ⏱ SLA Response Standards
- **CRITICAL**: 1 Hour Resolution Target (Flagged Red on breach)
- **HIGH**: 4 Hours Resolution Target (Flagged Orange on breach)
- **MEDIUM**: 8 Hours Resolution Target
- **LOW**: 24 Hours Resolution Target

---

## 👥 Author
- **Nithyashree N B**
*J.J. College of Engineering and Technology
