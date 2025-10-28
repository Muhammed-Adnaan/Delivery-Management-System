# Delivery Management System

A full-stack **Delivery Management System** that allows businesses to manage, track, and dispatch deliveries efficiently.  
This project is divided into two main parts:
- **Frontend** — the client-facing web interface  
- **Backend** — the RESTful API and database management system  

---

## Table of Contents
- [Introduction](#introduction)
- [Features](#-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
---

## Introduction

The **Delivery Management System (DMS)** simplifies the process of order creation, driver assignment, and delivery tracking for logistics, e-commerce, or courier companies.  
Admins can manage deliveries, drivers, and customers through a clean web interface.

---

## Features

- **User Roles:** Admins, Dispatchers, Drivers  
- **Order Management:** Create, assign, and track delivery orders  
- **Driver Assignment:** Allocate deliveries to drivers  
- **Status Tracking:** Update and view order statuses (Pending, In Transit, Delivered)  
- **Dashboard:** Overview of active and completed deliveries  
- **Authentication:** Secure login and JWT-based authorization  
- **API Integration:** RESTful API for frontend-backend communication  

---

## Architecture
```mermaid
flowchart TB
    %% =========================
    %% CLIENT LAYER
    %% =========================
    subgraph "Frontend Layer (React.js)"
        C[Customer UI/App]
        D[Driver App]
        A[Admin Dashboard]
    end

    %% =========================
    %% BACKEND LAYER
    %% =========================
    subgraph "Backend Layer (Node.js)"
        S2[Express.js REST API / Business Logic]
        S3[Socket.IO Real-Time Server]
    end

    %% =========================
    %% DATABASES & SERVICES
    %% =========================
    S4[(Database)]
    S5[(Map by Google API)]

    %% =========================
    %% CORE ORDER FLOW (REST)
    %% =========================
    C -->|"1. POST /orders (Transactional)"| S2
    S2 e3@-->|"2. Persistence (Validation / Save)"| S4
    S2 -->|"3. Automated Scheduling & Assignment Logic"| S3
    S2 -->|"4. Internal Trigger: Assignment Notification"| S3
    S3 -->|"5. EMIT 'delivery_assignment'"| D
    D -->|"6. PUT /deliveries/status (Accept Order)"| S2
    S2 e2@-->|"7. Update Delivery Status"| S4
    S2 -->|"8. Internal Trigger: Status Change"| S3
    S3 -->|"9. Broadcast 'status_change'"| C

    %% =========================
    %% REAL-TIME TRACKING FLOW (WebSocket)
    %% =========================
    C -->|"10. Emit 'location_update' (High Frequency)"| S3
    S3 -.->|"11. Targeted Broadcast"| D
    S3 -.->|"12. Targeted Broadcast to Admin/Managers"| A
    C -->|"13. Location Data for Map Rendering"| S5
    A -->|"14. Location Data for Map Rendering"| S5

    %% =========================
    %% DATABASE INTERACTIONS
    %% =========================
    S4 e4@-->|"Read/Write User & Order Data"| S2
    e2@{curve: linear }
    e3@{ curve: linear }
    e4@{  curve: linear }

```

---

## Tech Stack

### Frontend
- React.js 
- Axios for API requests
-  Tailwind CSS
### Backend
- Node.js + Express.js
- MySQL
- JWT Authentication
- dotenv for environment configuration

---

## ⚙️ Installation

### Prerequisites
Ensure you have installed:
- [Node.js](https://nodejs.org/) (v14 or above)
- npm or yarn
- A database (MySQL)
- Git

---

## Backend Setup


### Clone the repository
```bash
git clone https://github.com/Muhammed-Adnaan/Delivery-Management-System.git

cd Delivery-Management-System/backend
```
### Install dependencies
```bash
npm install
```
### Create environment file
```bash
cp .env.example .env
```
### Update .env with database credentials and JWT secret

### Start backend server
```bash
npm start
```
### or for development
```bash
npm run dev

```
## Frontend Setup
```bash
cd ../frontend
```
### Install dependencies
```bash
npm install
```
### Create environment file
```bash
cp .env.example .env
```
### Update .env with backend API URL (e.g. http://localhost:5000)

### Start frontend
```bash
npm start
```

## Usage

- Run backend and frontend concurrently.
- Register or log in as an Admin.
- Add drivers and customers.
- Create a delivery order and assign it to a driver.
- Update delivery status (Pending → In Transit → Delivered).
- View analytics and delivery history in the dashboard.

