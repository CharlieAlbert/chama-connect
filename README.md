# 🧾 Chama Connect: Chama Group Management System

## 🚀 Overview

Chama Connect is a comprehensive platform designed for managing chama (investment group) operations. Built on **Next.js** and **Supabase**, the application streamlines financial tracking, document management, and group governance for investment clubs.

## 🛠 Tech Stack

- **Frontend**: Next.js (React framework)
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Language**: TypeScript
- **Authentication**: Supabase Auth

---

## 📌 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn
- A [Supabase](https://supabase.com/) account and project

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Note:** Your environment variables should remain private and should not be shared in public repositories.

---

## 📥 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/CharlieAlbert/chama-connect.git
   cd chama-connect
   ```

2. **Install dependencies:**

   ```bash
   npm install  # or yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev  # or yarn dev
   ```

The app should now be running at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
📦 chama-connect
├── 📂 app/                  # Next.js app directory
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main entry page
│   ├── 📂 auth/             # Authentication pages
│   ├── 📂 dashboard/        # Dashboard views
│
├── 📂 components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── ...
│
├── 📂 contexts/             # Context providers (e.g., Auth)
│   ├── AuthContext.tsx
│
├── 📂 lib/
│   ├── 📂 supabase/         # Supabase integration
│   │   ├── client.ts        # Supabase client configuration
│   │   ├── server.ts        # Server-side Supabase utilities
│   │   ├── types.ts         # TypeScript types for Supabase
│   │   ├── middleware.ts    # Authentication middleware
│   │   ├── 📂 server-extended/ # Supabase server-side functions
│
├── 📂 public/               # Static assets (images, fonts, etc.)
│
├── 📂 utils/                # Utility functions and hooks
│   ├── supabase.ts          # Supabase helper functions
│   ├── auth.tsx             # Authentication hooks and utilities
│
├── .env                     # Environment variables (ignored in version control)
├── .gitignore               # Git ignore file
├── README.md                # Project documentation
└── package.json             # Project dependencies and scripts
```

---

## 🔐 Authentication

The project uses **Supabase Authentication** for user management.

- Authentication utilities are in `utils/auth.tsx`.
- Protected routes are handled by `lib/supabase/middleware.ts`.

---

## 📊 Database

**Supabase** is used as the primary database. Related configurations can be found in:

- `lib/supabase/types.ts` → Database types
- `lib/supabase/client.ts` → Supabase client setup
- `lib/supabase/server.ts` → Server-side utilities
- `lib/supabase/server-extended/` → Server-side functions

---

## ⚡ Server Functions

Server-side **CRUD operations** for Supabase are in:

- `lib/supabase/server-extended/`

---

## ✨ Features

✔️ User authentication (sign up, sign in, sign out)  
✔️ Protected routes with middleware  
✔️ Type-safe database operations  
✔️ Server-side rendering support  
✔️ PDF generation for reports with server-side rendering
✔️ Reliable document generation with error handling and recovery

Features will be updated as development progresses.

---

## 🏗️ Contributing

Want to contribute? Follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** 🚀

---

## 📬 Contact

📧 **Email:** [moneymongers20@gmail.com](mailto:moneymongers20@gmail.com)

---

## 🙌 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TypeScript](https://www.typescriptlang.org/) Community
