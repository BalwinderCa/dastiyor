export default function MobileAppPage() {
    return (
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h1 className="heading-lg">Download Our App</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '40px' }}>
                Get things done on the go. Available for iOS and Android.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button className="btn btn-primary" style={{ padding: '16px 32px' }}>Download on App Store</button>
                <button className="btn btn-primary" style={{ padding: '16px 32px' }}>Get it on Google Play</button>
            </div>
        </div>
    );
}
