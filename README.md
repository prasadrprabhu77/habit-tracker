# 📅 Habit Tracker

A responsive **Habit Tracker web application** built with **React + Vite** to help users track daily habits and improve productivity. Users can add and mark habits as complete, visualize progress, and stay consistent with daily goals.

---

## 🚀 Project Description

This project is part of the **FinTrack ecosystem** that simplifies personal productivity by helping users:

- Track daily habits
- Mark habits as complete / incomplete
- View habit progress over time
- Build consistency with everyday actions

This frontend app integrates easily with backend services (optional) and can store habit data via APIs, local storage, or Firebase.

---

## 🛠️ Tech Stack

- **React** — UI library  
- **Vite** — Fast build tool  
- **JavaScript (ES6+)**  
- **HTML & CSS**  
- **Firebase** — Hosted app and configuration included  
- **Tailwind CSS / Custom styles** (based on your code)

---

## 📁 Project Structure

habit-tracker/
├── public/ # Static assets & index.html
├── src/ # Source code
│ ├── components/ # UI components
│ ├── pages/ # Page views
│ ├── services/ # API / data services
│ ├── App.jsx # Main application
│ └── index.jsx # Entry point
├── .env # Environment variables
├── .gitignore
├── package.json
├── vite.config.js
├── firebase.json # Firebase config
├── .firebaserc # Firebase project config
└── README.md


---

## ⚙️ Setup Instructions

### Clone the repository

```bash
git clone https://github.com/prasadrprabhu77/habit-tracker.git
Install dependencies
cd habit-tracker
npm install
Configure environment variables

▶️ Run App Locally
Start development server:

npm run dev
This launches your app at:

http://localhost:5173
Build for production:

npm run build
Preview production build:

npm run preview
🧠 Features
✔ Add new habits
✔ Mark habits as completed
✔ Visualize habit activity
✔ Save habit data (local storage or backend)
✔ Responsive UI for mobile & desktop
✔ Easy to extend with APIs

🔌 Backend Integration
If your app connects to a backend, use environment variables to store the API base URL:

VITE_API_URL=https://yourbackendurl.com
Then access like:

axios.get(`${import.meta.env.VITE_API_URL}/habits`)
You can optionally use Firebase for authentication & data storage.

📦 Deployment
You can deploy this frontend to:

Vercel

Netlify

Firebase Hosting

GitHub Pages

Example for Vercel:

Push to GitHub

Connect repo on Vercel

Set environment vars (if any)

Deploy

No backend? Just serve as static app.

Live Demo: https://habit-tracker-zeta-ruby.vercel.app/

🧩 Contributing
Contributions are welcome!

Fork the repo

Create a new branch

Commit your changes

Open a Pull Request

👨‍💻 Author
Prasad Prabhu
GitHub: https://github.com/prasadrprabhu77