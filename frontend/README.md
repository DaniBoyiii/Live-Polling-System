# 🎉🔥 Intervue Live Polling System 🔥🎉

![Live Polling Banner](https://user-images.githubusercontent.com/yourusername/banner-image-url.png)

> An **interactive, real-time polling & quiz platform** tailored for classrooms and presentations —  
> students submit answers live, teachers create insightful polls & monitor progress instantly!

---

## 🚀 Demo & Deployment

- Frontend (React) hosted on [Your-Frontend-URL](https://your-frontend-app.vercel.app)  
- Backend (Node.js/Express API) hosted on [Your-Backend-URL](https://your-backend-app.up.railway.app)  

---

## 📋 Table of Contents

- [Project Overview](#project-overview)  
- [Key Features](#key-features)  
- [Tech Stack](#tech-stack)  
- [Setup & Installation](#setup--installation)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [Deployment](#deployment)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## 📖 Project Overview

Intervue Live Polling System is a modern, **real-time polling & quiz web app** built to engage students in the classroom or any live event.  
Teachers can create timed multiple-choice polls, track responses live, and view detailed results.  
Students can join polls instantly with a simple name entry — no delays, no confusion.

---

## ✨ Key Features

### For Students:
- 🔹 Quick, clean name entry with username uniqueness enforcement  
- 🔹 Join live polls seamlessly and submit answers in real-time  
- 🔹 See live aggregated results and compare with classmates  
- 🔹 Rejoin ongoing polls instantly if connection drops (socket reconnection)  

### For Teachers:
- 🔹 Powerful, intuitive poll creation with flexible timer settings (30s to 120s)  
- 🔹 Option to create multiple-choice questions with up to 6 options and mark correct answers  
- 🔹 Real-time tracking of student participation and votes  
- 🔹 Poll "Ask Question" button enabled only when no active poll or all students answered or poll expired  
- 🔹 View poll history with detailed percentage-based results  
- 🔹 Kick disruptive users from chat functionality  
- 🔹 Real-time chat room management alongside polling  

### Real-Time Communication:
- Built with **Socket.IO** to ensure lightning-fast bidirectional data flow  
- Distinct rooms for polls and global chat for smooth concurrent experiences  

### Robust Backend:
- REST API endpoints for polls management (create, vote, retrieve history)  
- MongoDB database with Mongoose ORM for scalable data storage  
- Centralized socket state for connected students and votes to maintain correctness  

---

## 🛠️ Tech Stack

| Layer       | Technologies                                |
| ----------- | ------------------------------------------|
| Frontend    | React, React Router, TailwindCSS           |
| Backend     | Node.js, Express, Socket.IO, Mongoose      |
| Database    | MongoDB                                    |
| Deployment  | Vercel (Frontend), Railway/Heroku (Backend)|
| Versioning  | Git & GitHub                               |

---

## ⚙️ Setup & Installation

### Prerequisites:
- Node.js >= v14  
- MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster  
- Git installed on your machine

### Clone the Repo:

