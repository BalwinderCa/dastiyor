export default function AuthLayout({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 80px - 300px)', // Adjust based on header/footer
            padding: '60px 20px',
            backgroundColor: 'var(--secondary)',
        }}>
            <div style={{
                backgroundColor: 'var(--white)',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid var(--border)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 className="heading-lg" style={{ marginBottom: '8px', fontSize: '2rem' }}>{title}</h1>
                    {subtitle && <p style={{ color: 'var(--text-light)' }}>{subtitle}</p>}
                </div>

                {children}
            </div>
        </div>
    );
}
