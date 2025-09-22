# 🛍️ Zestware — Modern E-Commerce Platform

[![Live Site](https://img.shields.io/badge/Live%20Demo-zestwearindia.store-brightgreen?style=for-the-badge)](https://www.zestwearindia.store)
[![GitHub Repo](https://img.shields.io/badge/View%20on-GitHub-blue?style=for-the-badge&logo=github)](https://github.com/arijitb17/Zestware)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](#license)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-Next.js%20%7C%20Prisma%20%7C%20TailwindCSS%20%7C%20Razorpay-blueviolet?style=for-the-badge)](#-tech-stack)

Zestware is a **feature-rich e-commerce platform** designed for **speed, security, and scalability**.  
Built with **Next.js**, **Prisma**, and **Tailwind CSS**, it delivers a seamless shopping experience with secure **Razorpay payment integration** and an optimized backend powered by PostgreSQL.

---

## ✨ Features

- 🛒 **Seamless Shopping** — Smooth browsing, cart management, and checkout.
- 🔐 **Secure Payments** — Integrated Razorpay API for reliable transactions.
- ⚡ **High Performance** — Fast load times, responsive design, and optimized queries.
- 📦 **Scalable Backend** — Prisma ORM + PostgreSQL for robust data management.
- 🎨 **Modern UI/UX** — Designed with Tailwind CSS & Framer Motion animations.
- 📩 **Email Support** — Integrated Nodemailer for transactional emails.
- 📱 **Responsive Design** — Works perfectly on desktop, tablet, and mobile.

---

## 🖥️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| **Frontend** | Next.js, React, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Prisma ORM, PostgreSQL (NeonDB) |
| **Payments** | Razorpay API |
| **Other**   | Axios, Lucide Icons, Three.js, Nodemailer |

---

## 📸 Screenshots

| Home Page | Product Page | Cart & Checkout |
|-----------|--------------|-----------------|
| ![Home](images/screenshot-home.png) | ![Product](images/screenshot-product.png) | ![Checkout](images/screenshot-checkout.png) |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ZestwareIndia/website-main.git
cd Zestware
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4️⃣ Migrate the Database

```bash
npx prisma migrate dev
```

### 5️⃣ Run the Development Server

```bash
npm run dev
```

---

## 🏗️ Deployment

* **Vercel** — Recommended for quick deployment.
* **AWS EC2** — Used for production in this project.
* **Docker** — Can be containerized for easier scaling.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch:

   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:

   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

---

## 👨‍💻 Author

**Arijit Banik**
💼 [Portfolio](https://www.arijitbanik.com)
🌐 [Live Project](https://www.zestwearindia.store)
📧 [arijitb17@gmail.com](mailto:arijitb17@gmail.com)
🐙 [GitHub](https://github.com/arijitb17)

---

## 📜 License

Distributed under the MIT License.
See [LICENSE](LICENSE) for more information.


---



