'use client';
import Link from 'next/link';

export default function CallToAction() {
    return (
        <section style={{ padding: '80px 0 100px' }}>
            <div className="container">
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #1E40AF 100%)',
                    borderRadius: '30px',
                    padding: '60px 40px',
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Abstract circles */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-10%',
                        width: '400px',
                        height: '400px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-50%',
                        right: '-10%',
                        width: '400px',
                        height: '400px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2' }}>
                            Ready to get your to-do list done?
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: '0.9', marginBottom: '40px' }}>
                            Join thousands of people who use Dastiyor to find trusted professionals for their tasks.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/create-task" className="btn" style={{
                                backgroundColor: 'white',
                                color: 'var(--primary)',
                                padding: '16px 40px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                border: 'none'
                            }}>
                                Post a Task Now
                            </Link>
                            <Link href="/register?type=provider" className="btn" style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '16px 40px',
                                fontSize: '1.1rem',
                                border: '1px solid rgba(255,255,255,0.4)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                Become a Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
