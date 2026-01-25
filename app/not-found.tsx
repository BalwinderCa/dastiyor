import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '500px'
            }}>
                <div style={{
                    fontSize: '8rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '16px'
                }}>
                    404
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '16px',
                    color: 'var(--text)'
                }}>
                    Page Not Found
                </h1>

                <p style={{
                    color: 'var(--text-light)',
                    fontSize: '1.1rem',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" className="btn btn-primary">
                        Go Home
                    </Link>
                    <Link href="/tasks" className="btn btn-outline">
                        Browse Tasks
                    </Link>
                </div>

                <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '12px' }}>Looking for something?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link href="/tasks" style={{ color: 'var(--primary)' }}>
                            📋 Find Tasks
                        </Link>
                        <Link href="/create-task" style={{ color: 'var(--primary)' }}>
                            ➕ Post a Task
                        </Link>
                        <Link href="/how-it-works" style={{ color: 'var(--primary)' }}>
                            ❓ How It Works
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
