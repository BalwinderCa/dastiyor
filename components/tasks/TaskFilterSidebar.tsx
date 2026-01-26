'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { LayoutGrid, Wrench, Monitor, SprayCan, Truck, Zap, Clock, Calendar } from 'lucide-react';
import { useState, useCallback, useTransition } from 'react';

const CATEGORIES = [
    { name: 'Все задачи', value: '', icon: LayoutGrid },
    { name: 'Ремонт', value: 'Ремонт', icon: Wrench },
    { name: 'IT и Веб', value: 'IT и Веб', icon: Monitor },
    { name: 'Уборка', value: 'Уборка', icon: SprayCan },
    { name: 'Доставка', value: 'Доставка', icon: Truck },
];

const CITIES = [
    'Душанбе',
    'Худжанд',
    'Бохтар',
    'Куляб',
    'Истаравшан',
    'Турсунзаде',
    'Исфара',
    'Канибадам',
];

const URGENCY_OPTIONS = [
    { label: 'Срочно', value: 'urgent', icon: Zap },
    { label: 'Обычная', value: 'normal', icon: Clock },
    { label: 'Гибкий график', value: 'low', icon: Calendar },
];

export default function TaskFilterSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Get current values from URL
    const currentCategory = searchParams.get('category') || '';
    const currentCity = searchParams.get('city') || '';
    const currentMinBudget = searchParams.get('minBudget') || '';
    const currentMaxBudget = searchParams.get('maxBudget') || '';
    const currentUrgency = searchParams.get('urgency')?.split(',').filter(Boolean) || [];
    const currentDateFrom = searchParams.get('dateFrom') || '';
    const currentDateTo = searchParams.get('dateTo') || '';

    // Local state for budget inputs
    const [minBudget, setMinBudget] = useState(currentMinBudget);
    const [maxBudget, setMaxBudget] = useState(currentMaxBudget);
    const [dateFrom, setDateFrom] = useState(currentDateFrom);
    const [dateTo, setDateTo] = useState(currentDateTo);

    // Create URL with new params
    const createQueryString = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === '') {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });

            return params.toString();
        },
        [searchParams]
    );

    const handleCategoryClick = (value: string) => {
        startTransition(() => {
            const queryString = createQueryString({ category: value || null });
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        });
    };

    const handleCityChange = (value: string) => {
        startTransition(() => {
            const queryString = createQueryString({ city: value || null });
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        });
    };

    const handleUrgencyChange = (value: string, checked: boolean) => {
        let newUrgency: string[];
        if (checked) {
            newUrgency = [...currentUrgency, value];
        } else {
            newUrgency = currentUrgency.filter(u => u !== value);
        }

        startTransition(() => {
            const queryString = createQueryString({
                urgency: newUrgency.length > 0 ? newUrgency.join(',') : null
            });
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        });
    };

    const handleBudgetApply = () => {
        startTransition(() => {
            const queryString = createQueryString({
                minBudget: minBudget || null,
                maxBudget: maxBudget || null
            });
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        });
    };

    const handleDateApply = () => {
        startTransition(() => {
            const queryString = createQueryString({
                dateFrom: dateFrom || null,
                dateTo: dateTo || null
            });
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        });
    };

    const clearFilters = () => {
        setMinBudget('');
        setMaxBudget('');
        setDateFrom('');
        setDateTo('');
        startTransition(() => {
            router.push(pathname);
        });
    };

    const hasActiveFilters = currentCategory || currentCity || currentMinBudget || currentMaxBudget || currentUrgency.length > 0 || currentDateFrom || currentDateTo;

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            height: 'fit-content',
            position: 'sticky',
            top: '100px',
            opacity: isPending ? 0.7 : 1,
            transition: 'opacity 0.2s',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '20px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Сбросить фильтры
                </button>
            )}

            {/* Categories */}
            <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                    Категории
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = currentCategory === cat.value;
                        return (
                            <button
                                key={cat.value || 'all'}
                                onClick={() => handleCategoryClick(cat.value)}
                                type="button"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                                    color: isActive ? '#6366F1' : '#4B5563',
                                    fontWeight: isActive ? '600' : '500',
                                    fontSize: '0.9rem',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                    width: '100%'
                                }}
                            >
                                <Icon size={18} />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '24px' }}></div>

            {/* Location */}
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    Местоположение
                </h4>
                <select
                    value={currentCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        outline: 'none',
                        fontSize: '0.95rem',
                        color: '#4B5563',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">Все города</option>
                    {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '24px' }}></div>

            {/* Budget Range */}
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    Бюджет (сомони)
                </h4>
                <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '12px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <input
                        type="number"
                        placeholder="От"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            width: '50%',
                            padding: '10px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <input
                        type="number"
                        placeholder="До"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            width: '50%',
                            padding: '10px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <button
                    onClick={handleBudgetApply}
                    type="button"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    Применить бюджет
                </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '24px' }}></div>

            {/* Date Filter */}
            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    Дата выполнения
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    <input
                        type="date"
                        placeholder="От"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="date"
                        placeholder="До"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <button
                    onClick={handleDateApply}
                    type="button"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    Применить дату
                </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E7EB', marginBottom: '24px' }}></div>

            {/* Urgency */}
            <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    Срочность
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {URGENCY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isChecked = currentUrgency.includes(opt.value);
                        return (
                            <label
                                key={opt.value}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem',
                                    color: '#4B5563',
                                    cursor: 'pointer'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleUrgencyChange(opt.value, e.target.checked)}
                                    style={{ accentColor: '#6366F1', width: '16px', height: '16px' }}
                                />
                                <Icon size={16} style={{ color: opt.value === 'urgent' ? '#EF4444' : '#6B7280' }} />
                                {opt.label}
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
