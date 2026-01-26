'use client';

export default function TaskSortSelect({ defaultValue }: { defaultValue?: string }) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort', e.target.value);
        window.location.href = url.toString();
    };

    return (
        <select
            name="sort"
            defaultValue={defaultValue || 'newest'}
            onChange={handleChange}
            style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: '#F9FAFB',
                fontWeight: '500',
                cursor: 'pointer'
            }}
        >
            <option value="newest">Сначала новые</option>
            <option value="budget-high">Цена: по убыванию</option>
            <option value="budget-low">Цена: по возрастанию</option>
        </select>
    );
}
