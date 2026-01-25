import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function MessagesPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.id) {
        redirect('/login');
    }

    const userId = payload.id as string;

    // Get all conversations
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
            sender: {
                select: { id: true, fullName: true }
            },
            receiver: {
                select: { id: true, fullName: true }
            },
            task: {
                select: { id: true, title: true }
            }
        }
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, any>();

    messages.forEach(msg => {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;

        const key = msg.taskId ? `${partnerId}-${msg.taskId}` : partnerId;

        if (!conversationsMap.has(key)) {
            conversationsMap.set(key, {
                id: key,
                partnerId,
                partnerName: partner.fullName,
                taskId: msg.taskId,
                taskTitle: msg.task?.title || null,
                lastMessage: msg.content,
                lastMessageAt: msg.createdAt,
                unreadCount: 0
            });
        }

        if (msg.receiverId === userId && !msg.isRead) {
            const conv = conversationsMap.get(key);
            conv.unreadCount++;
        }
    });

    const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return (
        <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container">
                <h1 className="heading-lg" style={{ marginBottom: '32px' }}>Сообщения</h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '320px 1fr',
                    gap: '24px',
                    height: 'calc(100vh - 200px)',
                    minHeight: '500px'
                }}>
                    {/* Conversations List */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: '1px solid var(--border)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border)',
                            fontWeight: '600'
                        }}>
                            Диалоги ({conversations.length})
                        </div>

                        <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
                            {conversations.length === 0 ? (
                                <div style={{
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    color: 'var(--text-light)'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                                    <p>Пока нет сообщений</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                                        Сообщения появятся здесь, когда вы свяжетесь с кем-то по поводу задания.
                                    </p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/messages?userId=${conv.partnerId}${conv.taskId ? `&taskId=${conv.taskId}` : ''}`}
                                        style={{
                                            display: 'block',
                                            padding: '16px 20px',
                                            borderBottom: '1px solid #f3f4f6',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            transition: 'background-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600' }}>{conv.partnerName}</span>
                                            {conv.unreadCount > 0 && (
                                                <span style={{
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        {conv.taskTitle && (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '4px' }}>
                                                📋 {conv.taskTitle}
                                            </div>
                                        )}
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-light)',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {conv.lastMessage}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Interface */}
                    <Suspense fallback={
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-light)'
                        }}>
                            <div>Загрузка чата...</div>
                        </div>
                    }>
                        <ChatInterface currentUserId={userId} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
