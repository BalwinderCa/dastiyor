// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill TextEncoder/TextDecoder for Node.js test environment
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Polyfill for Request/Response (needed for Next.js API routes in tests)
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers)
      this.body = init.body
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Headers(init.headers)
    }
    json() {
      return Promise.resolve(JSON.parse(this.body || '{}'))
    }
    text() {
      return Promise.resolve(this.body || '')
    }
  }
}

// Mock scrollIntoView for DOM elements
Element.prototype.scrollIntoView = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock jose library globally
jest.mock('jose', () => ({
    SignJWT: jest.fn().mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('mock.jwt.token'),
    })),
    jwtVerify: jest.fn().mockImplementation((token) => {
        if (!token || token === '') {
            return Promise.reject(new Error('Invalid token'));
        }
        if (token === 'mock.jwt.token' || token.split('.').length === 3) {
            return Promise.resolve({ 
                payload: { 
                    id: 'test-user-id', 
                    email: 'test@example.com', 
                    role: 'CUSTOMER' 
                } 
            });
        }
        return Promise.reject(new Error('Invalid token'));
    }),
}));

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'
process.env.DATABASE_URL = 'file:./test.db'
process.env.NODE_ENV = 'test'
