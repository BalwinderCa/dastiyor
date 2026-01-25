/**
 * Email Notification Service
 * 
 * This service handles sending email notifications.
 * To use in production, integrate with a service like:
 * - SendGrid (https://sendgrid.com)
 * - AWS SES (https://aws.amazon.com/ses/)
 * - Resend (https://resend.com)
 * - Nodemailer with SMTP
 */

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // In development, log the email instead of sending
        if (process.env.NODE_ENV === 'development') {
            console.log('='.repeat(60));
            console.log('EMAIL NOTIFICATION (Development Mode):');
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('Body:', options.text || options.html);
            console.log('='.repeat(60));
            return true;
        }

        // Production: Integrate with your email service
        // Example with SendGrid:
        /*
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        
        await sgMail.send({
            to: options.to,
            from: process.env.EMAIL_FROM!,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        */

        // Example with AWS SES:
        /*
        const AWS = require('aws-sdk');
        const ses = new AWS.SES({ region: process.env.AWS_REGION });
        
        await ses.sendEmail({
            Source: process.env.EMAIL_FROM!,
            Destination: { ToAddresses: [options.to] },
            Message: {
                Subject: { Data: options.subject },
                Body: {
                    Text: { Data: options.text || options.html },
                    Html: { Data: options.html },
                },
            },
        }).promise();
        */

        // Example with Resend:
        /*
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        */

        console.warn('Email service not configured. Set up an email provider in lib/notifications/email.ts');
        return false;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: 'Сброс пароля - Dastiyor',
        html: `
            <h2>Сброс пароля</h2>
            <p>Вы запросили сброс пароля для вашего аккаунта на Dastiyor.</p>
            <p>Нажмите на ссылку ниже, чтобы сбросить пароль:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                Сбросить пароль
            </a>
            <p>Ссылка действительна в течение 1 часа.</p>
            <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        `,
        text: `Сброс пароля - Dastiyor\n\nПерейдите по ссылке для сброса пароля: ${resetLink}\n\nСсылка действительна в течение 1 часа.`
    });
}

export async function sendTaskResponseNotification(email: string, taskTitle: string, providerName: string, price: string, taskLink: string): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: `Новое предложение на задание "${taskTitle}"`,
        html: `
            <h2>Новое предложение</h2>
            <p>На ваше задание "${taskTitle}" поступило новое предложение от ${providerName}.</p>
            <p><strong>Предложенная цена:</strong> ${price} с.</p>
            <a href="${taskLink}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                Посмотреть предложение
            </a>
        `,
        text: `Новое предложение на задание "${taskTitle}" от ${providerName}. Цена: ${price} с. Ссылка: ${taskLink}`
    });
}

export async function sendOfferAcceptedNotification(email: string, taskTitle: string, taskLink: string): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: `Ваш отклик принят - "${taskTitle}"`,
        html: `
            <h2>Отклик принят!</h2>
            <p>Вас выбрали исполнителем задания "${taskTitle}".</p>
            <p>Свяжитесь с заказчиком для обсуждения деталей.</p>
            <a href="${taskLink}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                Открыть задание
            </a>
        `,
        text: `Ваш отклик на задание "${taskTitle}" был принят. Свяжитесь с заказчиком. Ссылка: ${taskLink}`
    });
}
