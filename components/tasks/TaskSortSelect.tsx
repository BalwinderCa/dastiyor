'use client';

export default function TaskSortSelect({ defaultValue }: { defaultValue?: string }) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort', e.target.value);
        window.location.href = url.toString();
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border)',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '600',
                color: 'var(--text-light)',
                fontSize: '0.95rem',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                pointerEvents: 'none' // Clicks pass through to select
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                Sort by: {defaultValue === 'budget-high' ? 'High Budget' : defaultValue === 'budget-low' ? 'Low Budget' : 'Recent'}
            </div>
            <select
                name="sort"
                defaultValue={defaultValue || 'newest'}
                onChange={handleChange}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                }}
            >
                <option value="newest">Recent</option>
                <option value="budget-high">Budget: High to Low</option>
                <option value="budget-low">Budget: Low to High</option>
            </select>
        </div>
    );
}
