# Dastiyor - Online Services Marketplace

A full-featured online services marketplace platform where customers post service tasks and service providers (contractors) respond and complete them. Built with Next.js 16, React 19, Prisma, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)

## 🌟 Features

### User Roles
- **Guest**: Browse tasks, view public information, sign up/login
- **Customer**: Post tasks, manage responses, chat with providers, leave reviews, dedicated sidebar navigation
- **Service Provider**: Browse tasks, respond to tasks (with subscription), manage profile, view reviews, dedicated sidebar navigation
- **Administrator**: Full platform management, user moderation, analytics

### Core Functionality

#### Authentication & Authorization
- Email-based registration and login
- Password recovery with secure token system
- Role-based access control (Customer, Provider, Admin)
- JWT-based session management
- Rate limiting for security

#### Task Management
- **Task Creation**: Multi-step form with category, subcategory, description, location, budget, urgency, due date, and image uploads
- **Task Feed**: Advanced filtering via sidebar (Category, Location, Budget, Urgency, Date) and sorting options (Newest, Oldest, Budget High/Low)
- **Task Status**: OPEN → IN_PROGRESS → COMPLETED / CANCELLED
- **Task Details**: Full task information with responses, provider selection, and status management

#### Subscription System (Monetization)
- **Basic Plan**: 7 days, 15 responses per day
- **Standard Plan**: 30 days, 50 responses per month
- **Premium Plan**: 30 days, unlimited responses + priority placement in task feed
- Subscription validation before allowing responses
- Auto-expiration and status tracking

#### Response System
- Providers can respond to tasks with:
  - Proposed price
  - Message/comment
  - Estimated completion time
- Customers can:
  - View all responses
  - Accept a provider
  - Reject responses
- Response status tracking (PENDING, ACCEPTED, REJECTED)

#### Communication
- One-to-one chat between customers and providers
- Message history with read receipts
- Image sharing in messages
- Task-context messaging

#### Reviews & Ratings
- 1-5 star rating system
- Text comments
- Automatic rating calculation
- Reviews visible on provider profiles
- Reviews cannot be edited (immutable)

#### Notifications
- In-app notification system
- Real-time notification bell
- Notification types: NEW_OFFER, OFFER_ACCEPTED, OFFER_REJECTED, NEW_MESSAGE, TASK_COMPLETED
- Email notification service structure (ready for integration)
- SMS notification service structure (ready for integration)

#### Admin Panel
- Dashboard with platform statistics
- User management
- Task management and moderation
- Category management
- Subscription management
- System settings

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Database**: SQLite (Prisma ORM)
- **Authentication**: JWT (jose library)
- **Password Hashing**: bcryptjs
- **Icons**: Lucide React
- **Styling**: CSS Modules + Inline Styles

## 📋 Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/BalwinderCa/dastiyor.git
cd dastiyor
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
dastiyor/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── tasks/           # Task management
│   │   ├── responses/       # Response management
│   │   ├── messages/        # Chat/messaging
│   │   ├── reviews/         # Reviews & ratings
│   │   ├── subscription/    # Subscription management
│   │   └── notifications/   # Notifications
│   ├── admin/               # Admin panel pages
│   ├── create-task/         # Task creation page
│   ├── tasks/               # Task listing & details
│   ├── profile/             # User profile pages
│   ├── subscription/        # Subscription pages
│   └── ...                  # Other pages
├── components/               # React components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat interface
│   ├── create-task/        # Task creation steps
│   ├── landing/            # Landing page components
│   ├── reviews/            # Review components
│   ├── subscription/       # Subscription components
│   └── tasks/              # Task-related components
├── lib/                     # Utility libraries
│   ├── auth.ts             # JWT authentication
│   ├── prisma.ts           # Prisma client
│   ├── rate-limit.ts       # Rate limiting
│   ├── validation.ts       # Input validation
│   ├── notifications/      # Email & SMS services
│   └── payments/           # Payment integration
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── public/                  # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Tasks
- `POST /api/tasks` - Create a new task
- `POST /api/tasks/accept` - Accept a provider for a task
- `POST /api/tasks/complete` - Mark task as completed
- `POST /api/tasks/cancel` - Cancel a task

### Responses
- `POST /api/responses` - Submit a response to a task
- `POST /api/responses/reject` - Reject a response

### Messages
- `GET /api/messages?userId=...&taskId=...` - Get messages
- `POST /api/messages` - Send a message

### Reviews
- `GET /api/reviews?userId=...` - Get reviews for a user
- `POST /api/reviews` - Create a review

### Subscriptions
- `GET /api/subscription` - Get current subscription
- `POST /api/subscription` - Create/update subscription
- `DELETE /api/subscription` - Cancel subscription

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark all as read

### Upload
- `POST /api/upload` - Upload images (max 5MB)

## 🗄️ Database Schema

### Main Models
- **User**: Customers, Providers, Admins
- **Task**: Service tasks posted by customers
- **Response**: Provider offers/responses to tasks
- **Subscription**: Provider subscription plans
- **Message**: Chat messages between users
- **Review**: Ratings and reviews
- **Notification**: In-app notifications
- **PasswordReset**: Password reset tokens

See `prisma/schema.prisma` for complete schema definition.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Prisma database connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

### Optional (for production)
- `EMAIL_SERVICE_API_KEY` - For email notifications
- `SMS_SERVICE_API_KEY` - For SMS notifications
- `PAYMENT_GATEWAY_KEY` - For payment processing

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Database Migration in Production

```bash
npx prisma migrate deploy
npx prisma generate
```

### Recommended Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

### Production Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Use PostgreSQL or MySQL (not SQLite)
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Configure SMS service (Twilio/AWS SNS)
- [ ] Set up payment gateway (Stripe/PayPal)
- [ ] Configure cloud storage for uploads (S3/DigitalOcean Spaces)
- [ ] Set up proper CORS policies
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Commands

```bash
npx prisma generate          # Generate Prisma Client
npx prisma migrate dev       # Create and apply migration
npx prisma migrate deploy    # Apply migrations in production
npx prisma studio            # Open database GUI
npx prisma db push           # Push schema changes (dev only)
```

## 📝 Features Implementation Status

✅ **Completed**
- User authentication and authorization
- Task creation and management
- Response system with subscription validation
- Chat/messaging functionality
- Reviews and ratings
- Subscription system (Basic, Standard, Premium)
- Admin panel
- Notification system (in-app)
- File uploads
- Rate limiting
- Priority placement for Premium plans
- Response rejection
- Advanced filtering & sorting
- Subcategory support
- Sidebar navigation for Customer & Provider
- Estimated completion time

🔧 **Ready for Integration**
- Email notifications (service structure ready)
- SMS notifications (service structure ready)
- Payment gateway (service structure ready)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- All open-source contributors

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Built with ❤️ for the Dastiyor marketplace platform**
