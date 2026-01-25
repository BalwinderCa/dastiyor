import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TaskInfo from '@/components/tasks/TaskInfo';
import TaskSidebar from '@/components/tasks/TaskSidebar';
import ResponseList from '@/components/tasks/ResponseList';
import ReviewForm from '@/components/reviews/ReviewForm';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';

type Props = {
    params: {
        id: string;
    };
};

export default async function TaskDetailsPage({ params }: Props) {
    const { id } = await params;
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            user: true,
            assignedUser: true,
            responses: {
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            review: {
                include: {
                    reviewer: {
                        select: { fullName: true }
                    }
                }
            }
        },
    });

    if (!task) {
        notFound();
    }

    // Check current user for response permission
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let currentUserId = null;
    if (token) {
        const payload = await verifyJWT(token);
        if (payload) {
            currentUserId = payload.id as string;
        }
    }

    const isOwner = currentUserId === task.userId;
    const isAssignedProvider = currentUserId === task.assignedUserId;
    const canChat = (isOwner && task.assignedUserId) || isAssignedProvider;
    const chatPartnerId = isOwner ? task.assignedUserId : task.userId;
    const canReview = isOwner && task.status === 'COMPLETED' && !task.review && task.assignedUser;

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container">

                {/* Breadcrumb */}
                <div style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    Задания / {task.category} / {task.title}
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 360px',
                    gap: '40px',
                    alignItems: 'start'
                }}>
                    {/* Main Content */}
                    <main>
                        <div style={{
                            backgroundColor: 'var(--white)',
                            borderRadius: '16px',
                            padding: '40px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}>
                            <TaskInfo task={task} />
                        </div>

                        {/* Assigned Provider Info */}
                        {task.assignedUser && (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                marginTop: '24px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--accent)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem'
                                    }}>
                                        {task.assignedUser.fullName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                            Выбранный Исполнитель
                                        </div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                            {task.assignedUser.fullName}
                                        </div>
                                    </div>
                                </div>

                                {canChat && chatPartnerId && (
                                    <Link
                                        href={`/messages?userId=${chatPartnerId}&taskId=${task.id}`}
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        💬 Отправить сообщение
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Review Form (for completed tasks) */}
                        {canReview && task.assignedUser && (
                            <div style={{ marginTop: '24px' }}>
                                <ReviewForm
                                    taskId={task.id}
                                    providerName={task.assignedUser.fullName}
                                />
                            </div>
                        )}

                        {/* Existing Review Display */}
                        {task.review && (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                marginTop: '24px',
                                border: '1px solid var(--border)'
                            }}>
                                <h3 className="heading-md" style={{ marginBottom: '16px' }}>Отзыв</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <span style={{ color: '#fbbf24', fontSize: '1.5rem' }}>
                                        {'★'.repeat(task.review.rating)}
                                        <span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - task.review.rating)}</span>
                                    </span>
                                    <span style={{ fontWeight: '600' }}>
                                        {task.review.rating}/5
                                    </span>
                                </div>
                                {task.review.comment && (
                                    <p style={{ color: 'var(--text)', lineHeight: '1.6' }}>
                                        &ldquo;{task.review.comment}&rdquo;
                                    </p>
                                )}
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '12px' }}>
                                    — {task.review.reviewer.fullName}
                                </p>
                            </div>
                        )}

                        <ResponseList
                            taskId={task.id}
                            responses={task.responses}
                            currentUserId={currentUserId}
                            taskOwnerId={task.userId}
                            assignedUserId={task.assignedUserId}
                            taskStatus={task.status}
                        />
                    </main>

                    {/* Sidebar */}
                    <aside style={{ position: 'sticky', top: '100px' }}>
                        <TaskSidebar
                            task={task}
                            isOwner={currentUserId === task.userId}
                            canRespond={!!currentUserId && currentUserId !== task.userId}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}

