# 🚀 Dastiyor - Test Login Credentials

## Server Status
✅ **Development server is running at:** http://localhost:3000

---

## 👥 Test User Credentials

### 👤 Customer Account
**Use this account to:**
- Create tasks
- Accept/reject provider responses
- Chat with providers
- Leave reviews

**Login Details:**
```
Email:    customer@test.com
Password: password123
Role:     CUSTOMER
```

**Access:**
- Dashboard: http://localhost:3000/profile
- Create Task: http://localhost:3000/create-task
- My Tasks: http://localhost:3000/my-tasks
- Messages: http://localhost:3000/messages

---

### 🔧 Provider Account
**Use this account to:**
- Browse tasks
- Submit responses to tasks
- Manage active tasks
- View reviews and ratings

**Login Details:**
```
Email:        provider@test.com
Password:     password123
Role:         PROVIDER
Subscription: Premium (Active - 30 days)
```

**Access:**
- Dashboard: http://localhost:3000/provider/active-tasks
- Browse Tasks: http://localhost:3000/tasks
- My Responses: http://localhost:3000/provider/my-responses
- Portfolio: http://localhost:3000/provider/portfolio
- Messages: http://localhost:3000/messages

---

### 👑 Admin Account
**Use this account to:**
- Manage all users
- Moderate tasks
- Manage categories
- View platform analytics

**Login Details:**
```
Email:    admin@test.com
Password: password123
Role:     ADMIN
```

**Access:**
- Admin Dashboard: http://localhost:3000/admin
- User Management: http://localhost:3000/admin/users
- Task Management: http://localhost:3000/admin/tasks
- Categories: http://localhost:3000/admin/categories
- Moderation: http://localhost:3000/admin/moderation

---

## 🔐 Quick Login Steps

1. **Open your browser** and go to: http://localhost:3000
2. **Click "Login"** in the top right corner
3. **Enter credentials** from above
4. **Click "Login"** button

---

## 📝 Testing Scenarios

### Test Customer Flow:
1. Login as `customer@test.com`
2. Create a new task
3. Wait for provider response
4. Accept a response
5. Chat with provider
6. Mark task as completed
7. Leave a review

### Test Provider Flow:
1. Login as `provider@test.com`
2. Browse available tasks
3. Submit a response to a task
4. Wait for customer acceptance
5. Chat with customer
6. Complete the task
7. View your reviews

### Test Admin Flow:
1. Login as `admin@test.com`
2. View dashboard statistics
3. Manage users
4. Moderate tasks
5. Manage categories

---

## 🛠️ Server Management

### Start Server:
```bash
npm run dev
```

### Stop Server:
Press `Ctrl + C` in the terminal where the server is running

### Check Server Status:
Visit http://localhost:3000 in your browser

---

## 📌 Important Notes

- All test users share the same password: `password123`
- The provider account has an active Premium subscription
- The database is SQLite (dev.db) - all data persists between restarts
- To reset users, run: `npx tsx scripts/create-test-users.ts`

---

## 🎯 Next Steps

1. **Login as Customer** → Create a task
2. **Login as Provider** → Respond to the task
3. **Login as Customer** → Accept the response
4. **Test messaging** between both accounts
5. **Complete the task** and leave a review

---

*Last Updated: January 2025*
