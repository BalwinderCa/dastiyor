'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Lightbulb } from 'lucide-react';
import Step1Category from '@/components/create-task/Step1Category';
import Step2Details from '@/components/create-task/Step2Details';
import Step3Location from '@/components/create-task/Step3Location';
import Step4Budget from '@/components/create-task/Step4Budget';
import { toast } from '@/components/ui/Toast';

export default function CreateTaskPage() {
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const DRAFT_KEY = 'task_draft';
    
    const [formData, setFormData] = useState({
        category: '',
        subcategory: '',
        title: '',
        description: '',
        city: 'Dushanbe',
        address: '',
        budget: 'fixed',
        amount: '',
        urgency: 'normal',
        dueDate: '',
        images: [] as string[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);

    // Load draft or template on mount
    useEffect(() => {
        // Check for template first
        const template = sessionStorage.getItem('task_template');
        if (template) {
            try {
                const templateData = JSON.parse(template);
                setFormData(prev => ({ ...prev, ...templateData }));
                sessionStorage.removeItem('task_template');
                toast.info('Шаблон загружен');
            } catch (e) {
                // Invalid template, ignore
            }
        }
        
        // Then check for draft
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...draft }));
                setHasDraft(true);
            } catch (e) {
                // Invalid draft, ignore
            }
        }
    }, []);

    // Auto-save draft
    useEffect(() => {
        const hasContent = formData.title || formData.description || formData.category;
        if (hasContent && !isSubmitting) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
            setHasDraft(true);
        }
    }, [formData, isSubmitting]);

    const saveDraft = () => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        toast.success('Черновик сохранен');
        setHasDraft(true);
    };

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
        toast.info('Черновик удален');
    };

    // Add upload handlers
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const fd = new FormData();
                fd.append('file', files[i]);
                const res = await fetch('/api/upload', { method: 'POST', body: fd });
                if (res.ok) {
                    const json = await res.json();
                    setFormData(prev => ({ ...prev, images: [...prev.images, json.url] }));
                } else {
                    toast.error('Не удалось загрузить изображение');
                }
            }
        } catch (err) {
            toast.error('Ошибка при загрузке изображения');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const router = useRouter();

    const handleNext = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Submit form
            handleSubmit({ ...formData, ...data });
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async (finalData: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (res.status === 401) {
                toast.warning('Необходимо войти в систему для создания задания');
                router.push('/login?redirect=/create-task');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Не удалось создать задание');
            }

            const json = await res.json();
            // Clear draft on successful submission
            localStorage.removeItem(DRAFT_KEY);
            setHasDraft(false);
            toast.success('Задание успешно создано!');
            // Redirect to the new task details
            setTimeout(() => router.push(`/tasks/${json.task.id}`), 1000);

        } catch (error: any) {
            toast.error(`Ошибка при создании задания: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div className="spinner" style={{ fontSize: '4rem', marginBottom: '24px' }}>⏳</div>
                <h1 className="heading-lg">Публикация...</h1>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 className="heading-lg" style={{ marginBottom: '8px' }}>Создать новое задание</h1>
                        <p style={{ color: '#6B7280' }}>Заполните данные ниже, чтобы найти лучшего исполнителя.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
                    {/* Main Form Column */}
                    <div>
                        {/* Progress Bar (Visual) */}
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ backgroundColor: '#DBEAFE', color: '#3B82F6', padding: '4px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>Шаг 1 из 4</span>
                                <span style={{ fontWeight: '600', color: '#111827' }}>Информация о задании</span>
                            </div>
                            <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>25% Завершено</div>
                        </div>

                        {/* General Information Card */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Общая информация</h2>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Название задания</label>
                                <input
                                    type="text"
                                    placeholder="напр., Починить кран на кухне"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Категория</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: 'white' }}
                                    >
                                        <option value="">Выберите категорию</option>
                                        <option value="Home Repair">Домашний ремонт</option>
                                        <option value="Cleaning">Уборка</option>
                                        <option value="Delivery">Доставка</option>
                                        <option value="Tech Support">IT и Техника</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Подкатегория</label>
                                    <select 
                                        value={formData.subcategory}
                                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', backgroundColor: 'white' }}
                                    >
                                        <option value="">Выберите подкатегорию</option>
                                        <option value="Plumbing">Сантехника</option>
                                        <option value="Electrician">Электрика</option>
                                        <option value="Carpentry">Столярные работы</option>
                                        <option value="Painting">Покраска</option>
                                        <option value="Cleaning">Уборка</option>
                                        <option value="Moving">Переезд</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Подробное описание</label>
                                <textarea
                                    placeholder="Опишите проблему или задачу подробно..."
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', resize: 'vertical' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>0 / 2000 символов</div>
                            </div>

                            {/* Image Upload Section */}
                            <div style={{ marginTop: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Фотографии (Опционально)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <img src={img} alt="Task" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                            >✕</button>
                                        </div>
                                    ))}
                                    <label style={{
                                        width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed #D1D5DB',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        backgroundColor: uploading ? '#F3F4F6' : 'white'
                                    }}>
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                                        <span style={{ fontSize: '24px', color: '#9CA3AF' }}>+</span>
                                    </label>
                                </div>
                                {uploading && <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>Загрузка фото...</div>}
                            </div>
                        </div>

                        {/* Location Details Card */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Расположение</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Город / Район</label>
                                    <input
                                        type="text"
                                        placeholder="Введите ваш город"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Срочность</label>
                                    <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                                        {[
                                            { id: 'normal', label: 'Обычно' },
                                            { id: 'urgent', label: 'Срочно' },
                                            { id: 'low', label: 'Не срочно' }
                                        ].map((u) => (
                                            <button 
                                                key={u.id} 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, urgency: u.id })}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    border: 'none',
                                                    backgroundColor: formData.urgency === u.id ? '#EFF6FF' : 'white',
                                                    color: formData.urgency === u.id ? '#3B82F6' : '#6B7280',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    borderRight: '1px solid #E5E7EB',
                                                    fontWeight: formData.urgency === u.id ? '600' : '400'
                                                }}
                                            >
                                                {u.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Точный адрес</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><MapPin size={20} /></span>
                                    <input
                                        type="text"
                                        placeholder="Улица, дом, квартира..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Срок выполнения (Опционально)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                                />
                            </div>

                            {/* Map Placeholder */}
                            <div style={{ height: '200px', backgroundColor: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', border: '2px dashed #BFDBFE' }}>
                                Карта (Здесь будет интерактивная карта)
                            </div>
                        </div>

                        {/* Pricing & Schedule */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Стоимость и График</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Тип бюджета</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => setFormData({ ...formData, budget: 'fixed' })}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '8px',
                                                border: formData.budget === 'fixed' ? '2px solid #3B82F6' : '1px solid #D1D5DB',
                                                backgroundColor: formData.budget === 'fixed' ? '#EFF6FF' : 'white',
                                                color: formData.budget === 'fixed' ? '#3B82F6' : '#6B7280',
                                                fontWeight: '600', cursor: 'pointer'
                                            }}>Фикс. цена</button>
                                        <button
                                            onClick={() => setFormData({ ...formData, budget: 'negotiable' })}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '8px',
                                                border: formData.budget === 'negotiable' ? '2px solid #3B82F6' : '1px solid #D1D5DB',
                                                backgroundColor: formData.budget === 'negotiable' ? '#EFF6FF' : 'white',
                                                color: formData.budget === 'negotiable' ? '#3B82F6' : '#6B7280',
                                                fontWeight: '600', cursor: 'pointer'
                                            }}>Договорная</button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Бюджет (TJS)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        disabled={formData.budget === 'negotiable'}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                {hasDraft && '💾 Черновик сохранен'}
                            </div>
                            {hasDraft && (
                                <button
                                    onClick={clearDraft}
                                    style={{
                                        padding: '12px 24px',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        fontWeight: '600',
                                        color: '#6B7280',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Удалить черновик
                                </button>
                            )}
                            <button
                                onClick={saveDraft}
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    fontWeight: '600',
                                    color: '#374151',
                                    cursor: 'pointer'
                                }}
                            >
                                💾 Сохранить черновик
                            </button>
                            <button
                                onClick={() => handleSubmit(formData)}
                                disabled={isSubmitting}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#06B6D4',
                                    color: 'white',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}>
                                {isSubmitting ? 'Публикация...' : 'Опубликовать'}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div>
                        {/* Tips Widget */}
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Lightbulb size={24} color="#F59E0B" fill="#F59E0B" />
                                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Советы для отличного задания</h3>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontWeight: '700', color: '#0EA5E9', minWidth: '20px' }}>01</span>
                                    <div><span style={{ fontWeight: '600', color: '#111827' }}>Будьте точны:</span> Укажите точные размеры или бренды, если применимо.</div>
                                </li>
                                <li style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontWeight: '700', color: '#0EA5E9', minWidth: '20px' }}>02</span>
                                    <div><span style={{ fontWeight: '600', color: '#111827' }}>Фото помогают:</span> Задания с фото получают в 3 раза больше откликов.</div>
                                </li>
                                <li style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontWeight: '700', color: '#0EA5E9', minWidth: '20px' }}>03</span>
                                    <div><span style={{ fontWeight: '600', color: '#111827' }}>Укажите честную цену:</span> Изучите похожие задания, чтобы привлечь лучших профи.</div>
                                </li>
                            </ul>
                        </div>

                        {/* Help Widget */}
                        <div style={{ backgroundColor: '#E0F2FE', borderRadius: '16px', padding: '24px', color: '#0369A1' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>Нужна помощь?</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>Наша поддержка доступна 24/7, чтобы помочь вам создать идеальное задание.</p>
                            <button style={{ color: '#0284C7', fontWeight: '600', border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }}>Написать нам →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
