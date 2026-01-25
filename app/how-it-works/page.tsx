export default function HowItWorksPage() {
    const steps = [
        {
            title: "1. Создайте задание",
            description: "Опишите, что нужно сделать, укажите бюджет и выберите удобное время.",
            icon: "📝"
        },
        {
            title: "2. Получите предложения",
            description: "Получайте отклики от проверенных специалистов. Сравнивайте их профили, рейтинги и цены.",
            icon: "💬"
        },
        {
            title: "3. Выберите исполнителя",
            description: "Выберите лучшего специалиста для вашей задачи и обсудите детали в чате.",
            icon: "✅"
        },
        {
            title: "4. Закройте сделку",
            description: "Специалист выполняет задание. Вы оплачиваете работу напрямую и оставляете отзыв.",
            icon: "🌟"
        }
    ];

    return (
        <div style={{ padding: '60px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
                    <h1 className="heading-lg" style={{ marginBottom: '24px' }}>Как работает Dastiyor</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>
                        Найти помощь легко. Следуйте этим простым шагам, чтобы выполнить ваши задачи.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '40px',
                    marginBottom: '80px'
                }}>
                    {steps.map((step, index) => (
                        <div key={index} style={{
                            textAlign: 'center',
                            padding: '32px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '24px' }}>{step.icon}</div>
                            <h3 className="heading-md" style={{ marginBottom: '16px' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>{step.description}</p>
                        </div>
                    ))}
                </div>

                <div style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '60px',
                    textAlign: 'center'
                }}>
                    <h2 className="heading-lg" style={{ color: 'white', marginBottom: '24px' }}>Готовы начать?</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9 }}>
                        Опубликуйте своё первое задание за секунды и найдите необходимую помощь.
                    </p>
                    <a href="/create-task" className="btn" style={{
                        backgroundColor: 'white',
                        color: 'var(--primary)',
                        padding: '16px 32px',
                        fontSize: '1.1rem',
                        display: 'inline-block'
                    }}>
                        Создать задание
                    </a>
                </div>
            </div>
        </div>
    );
}
