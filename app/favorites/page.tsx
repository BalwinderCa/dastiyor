import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TaskCard from '@/components/tasks/TaskCard';
import { Heart } from 'lucide-react';

export default async function FavoritesPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
        redirect('/login');
    }

    const favorites = await prisma.taskFavorite.findMany({
        where: { userId: payload.id as string },
        include: {
            task: {
                include: {
                    _count: {
                        select: { responses: true }
                    },
                    user: {
                        select: { fullName: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Heart size={32} color="#EF4444" fill="#EF4444" />
                    <div>
                        <h1 className="heading-lg">Избранные задания</h1>
                        <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>
                            Задания, которые вы сохранили
                        </p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        padding: '60px',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>❤️</div>
                        <h3 className="heading-md" style={{ marginBottom: '8px' }}>Нет избранных заданий</h3>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                            Сохраняйте интересные задания, чтобы вернуться к ним позже
                        </p>
                        <Link href="/tasks" className="btn btn-primary">
                            Найти задания
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {favorites.map((fav) => (
                            <TaskCard
                                key={fav.task.id}
                                task={{
                                    id: fav.task.id,
                                    title: fav.task.title,
                                    category: fav.task.category,
                                    budget: fav.task.budgetType === 'fixed' ? `${fav.task.budgetAmount} с.` : 'Договорная',
                                    city: fav.task.city,
                                    postedAt: new Date(fav.task.createdAt).toLocaleDateString('ru-RU'),
                                    description: fav.task.description,
                                    urgency: fav.task.urgency,
                                    responseCount: fav.task._count.responses,
                                    status: fav.task.status
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
