export default function SafetyPage() {
    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
            <h1 className="heading-lg">Safety at Dastiyor</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '40px' }}>
                Your safety is our top priority. Here is how we protect our community.
            </p>

            <section style={{ marginBottom: '40px' }}>
                <h2 className="heading-md">Verified Professionals</h2>
                <p>We perform background checks and verify IDs for all service providers on our platform.</p>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <h2 className="heading-md">Secure Payments</h2>
                <p>Payments are held in escrow until the job is completed to your satisfaction.</p>
            </section>

            <section>
                <h2 className="heading-md">24/7 Support</h2>
                <p>Our support team is always available to assist with any concerns or emergency situations.</p>
            </section>
        </div>
    );
}
