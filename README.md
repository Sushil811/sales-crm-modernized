# 🚀 Canova CRM: Modern Sales Management

Hey! Welcome to the **Canova CRM** repository. This project was built to solve a simple problem: making sales workflows feel less like a chore and more like a high-performance dashboard. 

Whether you're an admin trying to keep track of the big picture or a sales rep managing your daily hustle, this app has your back.

## 🌟 What is this?

Canova CRM is a full-stack sales management system. We’ve focused on creating a clean, "glassmorphic" interface that looks premium and feels fast. It handles everything from the moment a lead is uploaded to the final "Closed" status, all while tracking employee attendance and productivity.

### **The "Why" behind the features:**
*   **For Admins**: No more guessing. See your conversion rates, unassigned leads, and top-performing staff at a glance with real-time charts.
*   **For Sales Teams**: A dedicated panel where you can check-in, manage your breaks, and tackle your assigned leads without distractions.
*   **Lead Hustle**: Simple "Hot/Warm/Cold" tagging so you know exactly which lead needs your attention *last minute*.

---

## 🛠️ Tech Stack (The Engine)

*   **Frontend**: React + Vite (for that lightning-fast dev experience).
*   **Backend**: Node.js & Express (solid and scalable).
*   **Database**: MongoDB + Mongoose (flexible data for flexible sales).
*   **Visuals**: Recharts (because data should look pretty).
*   **Styling**: Pure CSS (no bulky frameworks, just custom, pixel-perfect design).

---

## 🚀 Getting Started

If you want to run this locally, it’s pretty straightforward.

### 1. Clone & Install
```bash
# Clone the repo
git clone https://github.com/Sushil811/sales-crm-modernized.git

# Install everything (One command to rule them all)
npm run install-all
```

### 2. Set your Env
Create a `.env` file in the `server` folder:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=something_random_and_secure
PORT=5000
```

### 3. Seed the Data (Important!)
To get those initial admin and sales accounts, run:
```bash
npm run seed
```

### 4. Run it!
```bash
# Start both client and server
npm run dev
```

---

## ☁️ Deployment

This project is optimized for **Render**. We've included a `render.yaml` blueprint that sets up the Web Service and handles the build process automatically. Just connect your repo and you're good to go!

---

## 🤝 Contributing

Got a better way to visualize the data or a cool feature idea? Feel free to fork it, play around, and send a PR. Let's make sales management better for everyone.

**Happy Selling!** 📈
