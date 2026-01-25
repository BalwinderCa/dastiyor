'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
                // In development, show the debug token
                if (data.debug_token) {
                    console.log('Debug Reset Token:', data.debug_token);
                }
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    padding: '48px',
                    maxWidth: '450px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📧</div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '16px' }}>
                        Check Your Email
                    </h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '24px', lineHeight: '1.6' }}>
                        If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
                        The link will expire in 1 hour.
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '32px' }}>
                        Didn&apos;t receive the email? Check your spam folder or try again.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="btn btn-outline"
                        >
                            Try Again
                        </button>
                        <Link href="/login" className="btn btn-primary">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '48px',
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        textDecoration: 'none'
                    }}>
                        Dastiyor
                    </Link>
                </div>

                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
                    Forgot Password?
                </h1>
                <p style={{
                    color: 'var(--text-light)',
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    No worries! Enter your email and we&apos;ll send you a reset link.
                </p>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '1rem',
                            marginBottom: '24px'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <Link href="/login" style={{
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
