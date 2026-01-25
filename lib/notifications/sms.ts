/**
 * SMS Notification Service
 * 
 * This service handles sending SMS notifications.
 * To use in production, integrate with a service like:
 * - Twilio (https://www.twilio.com)
 * - AWS SNS (https://aws.amazon.com/sns/)
 * - MessageBird (https://www.messagebird.com)
 * - Nexmo/Vonage (https://www.vonage.com)
 */

interface SMSOptions {
    to: string; // Phone number in E.164 format (e.g., +992901234567)
    message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
    try {
        // In development, log the SMS instead of sending
        if (process.env.NODE_ENV === 'development') {
            console.log('='.repeat(60));
            console.log('SMS NOTIFICATION (Development Mode):');
            console.log('To:', options.to);
            console.log('Message:', options.message);
            console.log('='.repeat(60));
            return true;
        }

        // Production: Integrate with your SMS service
        // Example with Twilio:
        /*
        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!
        );
        
        await client.messages.create({
            body: options.message,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: options.to,
        });
        */

        // Example with AWS SNS:
        /*
        const AWS = require('aws-sdk');
        const sns = new AWS.SNS({ region: process.env.AWS_REGION });
        
        await sns.publish({
            PhoneNumber: options.to,
            Message: options.message,
        }).promise();
        */

        // Example with MessageBird:
        /*
        const messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);
        
        await new Promise((resolve, reject) => {
            messagebird.messages.create({
                originator: process.env.MESSAGEBIRD_ORIGINATOR!,
                recipients: [options.to],
                body: options.message,
            }, (err: any, response: any) => {
                if (err) reject(err);
                else resolve(response);
            });
        });
        */

        console.warn('SMS service not configured. Set up an SMS provider in lib/notifications/sms.ts');
        return false;
    } catch (error) {
        console.error('SMS sending error:', error);
        return false;
    }
}

export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Ваш код подтверждения Dastiyor: ${code}. Код действителен 10 минут.`
    });
}

export async function sendTaskResponseSMS(phone: string, taskTitle: string, providerName: string, price: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Новое предложение на задание "${taskTitle}" от ${providerName}. Цена: ${price} с. Dastiyor`
    });
}

export async function sendOfferAcceptedSMS(phone: string, taskTitle: string): Promise<boolean> {
    return sendSMS({
        to: phone,
        message: `Ваш отклик на задание "${taskTitle}" принят! Свяжитесь с заказчиком. Dastiyor`
    });
}
