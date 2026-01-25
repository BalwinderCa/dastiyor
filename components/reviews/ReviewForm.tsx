'use client';

import { useState } from 'react';

type Props = {
    taskId: string;
    providerName: string;
    onReviewSubmitted?: () => void;
};

export default function ReviewForm({ taskId, providerName, onReviewSubmitted }: Props) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, rating, comment })
            });

            if (res.ok) {
                setSubmitted(true);
                onReviewSubmitted?.();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review error:', error);
            alert('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div style={{
                backgroundColor: '#f0fdf4',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                border: '1px solid #bbf7d0'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                    Thank you for your review!
                </h3>
                <p style={{ color: '#15803d' }}>
                    Your feedback helps build trust in our community.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid var(--border)'
        }}>
            <h3 className="heading-md" style={{ marginBottom: '24px' }}>
                Leave a Review for {providerName}
            </h3>

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
                        How was your experience?
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '2.5rem',
                                    transition: 'transform 0.1s'
                                }}
                            >
                                <span style={{
                                    color: (hoveredRating || rating) >= star ? '#fbbf24' : '#d1d5db'
                                }}>
                                    ★
                                </span>
                            </button>
                        ))}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '8px' }}>
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent!'}
                    </div>
                </div>

                {/* Comment */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Tell us more (optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Share your experience with this provider..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px' }}
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
}
