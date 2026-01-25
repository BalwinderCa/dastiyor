export default function HelpPage() {
    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
            <h1 className="heading-lg">Центр помощи</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '40px' }}>
                Найдите ответы на частые вопросы.
            </p>

            <div style={{ display: 'grid', gap: '24px' }}>
                {[
                    { q: 'Как создать задание?', a: 'Нажмите кнопку "Создать задание" в верхнем меню, заполните форму и опубликуйте.' },
                    { q: 'Как оплатить услуги?', a: 'Оплата производится напрямую исполнителю после выполнения работы.' },
                    { q: 'Что если я не доволен результатом?', a: 'Вы можете оставить отзыв или связаться с поддержкой для разрешения спора.' }
                ].map((item, i) => (
                    <div key={i} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 className="heading-md" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{item.q}</h3>
                        <p style={{ color: 'var(--text-light)' }}>
                            {item.a}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
