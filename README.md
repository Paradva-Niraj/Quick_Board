<div align="center">

# 📌 Quick Board

### **Online Noticeboard System for Educational Institutions**

[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

---

</div>

## 📖 Overview

**Quick Board** is a comprehensive online noticeboard management system designed for educational institutions [attached_file:1]. The platform provides role-based access for **Admins**, **Faculties**, and **Students**, enabling efficient course management, notice distribution, and real-time communication [attached_file:1]. Built with modern web technologies, Quick Board combines a lightning-fast Vite-powered React frontend with a robust ASP.NET Core Web API backend [attached_file:1].

---

## ✨ Key Features

### 🔐 Role-Based Access Control

| Role | Capabilities |
|------|--------------|
| **Admin** | Manage faculties, students, courses, and publish institution-wide notices [attached_file:1] |
| **Faculty** | Post course-specific notices, manage course materials, interact with students [attached_file:1] |
| **Student** | View all relevant notices, enroll in courses, access course materials [attached_file:1] |

### 🚀 Technical Highlights

- ✅ **RESTful API** with JSON responses for seamless frontend-backend communication [attached_file:1]
- ✅ **CRUD Operations** for all entities (Admins, Courses, Faculties, Students, Notices) [attached_file:1]
- ✅ **MySQL Integration** via Entity Framework Core with Pomelo provider [attached_file:1]
- ✅ **Swagger UI** for interactive API testing and documentation [attached_file:1]
- ✅ **CORS Enabled** for secure cross-origin requests [attached_file:1]
- ✅ **Error Handling** with meaningful, standardized error messages [attached_file:1]
- ✅ **Responsive Design** optimized for desktop and mobile devices

---

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend

| Technology | Purpose |
|------------|---------|
| **React** | UI library for building interactive interfaces [web:6] |
| **Vite** | Next-generation frontend build tool [web:6] |
| **JavaScript** (80.7%) | Primary frontend language [attached_file:1] |

</td>
<td align="center" width="50%">

### Backend

| Technology | Purpose |
|------------|---------|
| **ASP.NET Core 8.0** | Web API framework [attached_file:1] |
| **Entity Framework Core** | ORM for database operations [attached_file:1] |
| **C#** (19.2%) | Backend programming language [attached_file:1] |
| **MySQL** | Relational database management [attached_file:1] |

</td>
</tr>
</table>

---

## ⚙️ Installation & Setup

### Prerequisites

Before starting, ensure you have the following installed [web:6]:

- [Node.js](https://nodejs.org/) (v18+) & npm
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [MySQL](https://www.mysql.com/) (via XAMPP/phpMyAdmin recommended) [attached_file:1]
- Git

---

### 🔧 Backend Setup

1. **Clone the repository:**
```
git clone https://github.com/Paradva-Niraj/Quick_Board.git
cd Quick_Board
```

4. **Configure database connection:**

Open `appsettings.json` and update the connection string:
{
"ConnectionStrings": {
"DefaultConnection": "server=localhost;database=quickboard_db;user=root;password=yourpassword"
}
}


The API will be available at: `https://localhost:5001` [attached_file:1]

Access Swagger UI at: `https://localhost:5001/swagger` [attached_file:1]

---

### 💻 Frontend Setup

1. **Navigate to frontend directory:**
```
cd ../frontend
```

2. **Install dependencies:**

```
npm i
```
3. **Configure API endpoint:**

Create/update `.env` file:
```
VITE_API_BASE_URL=
VITE_APP_CLOUDINARY_CLOUD_NAME=
VITE_APP_CLOUDINARY_UPLOAD_PRESET=   # 👈 use the preset name you created
VITE_APP_CLOUDINARY_SIGNED=                       # set "true" to use signed flow
VITE_APP_CLOUDINARY_URL=
```
```
backend .env
Jwt__Key = 
Jwt__Issuer=
Jwt__Audience=
Jwt__ExpiresInMinutes=1440
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
CA_CERT_CONTENT=
-----END CERTIFICATE-----"
```

> **Note:** All API endpoints return standardized JSON responses with proper error handling [attached_file:1]

---

## 🎯 Usage Guide

### Admin Workflow

1. Log in to the Admin Dashboard
2. Navigate to **User Management** to add/remove faculties and students
3. Create courses and assign faculties
4. Publish institution-wide notices from the **Notice Board** section

### Faculty Workflow

1. Access the Faculty Portal with credentials
2. View assigned courses
3. Post course-specific notices and announcements
4. Manage course materials and resources

### Student Workflow

1. Log in to the Student Portal
2. Browse all active notices sorted by date/priority
3. View notices filtered by enrolled courses
4. Access course materials shared by faculty

---


---

## 🤝 Contributing

Contributions are welcome! Please follow these steps [web:7]:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Niraj Paradva**

- GitHub: [@Paradva-Niraj](https://github.com/Paradva-Niraj)
- Repository: [Quick_Board](https://github.com/Paradva-Niraj/Quick_Board)

---

## 📞 Support

For questions, issues, or feature requests:

- Open an issue on [GitHub Issues](https://github.com/Paradva-Niraj/Quick_Board/issues)
- Contact via GitHub profile

---

## 🌟 Acknowledgments

- Built with [ASP.NET Core](https://dotnet.microsoft.com/) [attached_file:1]
- Frontend powered by [Vite](https://vitejs.dev/) and [React](https://react.dev/)
- Database management with [MySQL](https://www.mysql.com/) [attached_file:1]
- API documentation via [Swagger UI](https://swagger.io/) [attached_file:1]

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ for educational institutions**

</div>
