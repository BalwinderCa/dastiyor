# Testing Guide

This project uses Jest and React Testing Library for testing.

## Setup

Install dependencies:
```bash
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Structure

### Unit Tests
- **Utility Functions**: `lib/__tests__/`
  - `validation.test.ts` - Input validation tests
  - `auth.test.ts` - JWT authentication tests

### API Route Tests
- **Auth Routes**: `app/api/auth/__tests__/`
  - `login.test.ts` - Login endpoint tests
  - `register.test.ts` - Registration endpoint tests

- **Task Routes**: `app/api/tasks/__tests__/`
  - `route.test.ts` - Task CRUD operations

- **Message Routes**: `app/api/messages/__tests__/`
  - `route.test.ts` - Messaging functionality

- **Response Routes**: `app/api/responses/__tests__/`
  - `route.test.ts` - Task response/offer functionality

### Component Tests
- **Task Components**: `components/tasks/__tests__/`
  - `TaskCard.test.tsx` - Task card component tests

- **Chat Components**: `components/chat/__tests__/`
  - `ChatInterface.test.tsx` - Chat interface tests

- **UI Components**: `components/ui/__tests__/`
  - `Toast.test.tsx` - Toast notification tests

## Writing New Tests

### API Route Test Template
```typescript
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        // Mock Prisma methods
    },
}));

describe('/api/endpoint', () => {
    it('should handle request correctly', async () => {
        const request = new NextRequest('http://localhost/api/endpoint');
        const response = await GET(request);
        expect(response.status).toBe(200);
    });
});
```

### Component Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
    it('should render correctly', () => {
        render(<Component />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });
});
```

## Test Coverage Goals

- API Routes: 80%+
- Components: 70%+
- Utility Functions: 90%+

## Notes

- Tests use mocked Prisma client to avoid database dependencies
- Next.js router is mocked for component tests
- Environment variables are set in `jest.setup.js`
