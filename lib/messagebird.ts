
const messagebird = require('messagebird');

const API_KEY = process.env.MESSAGEBIRD_API_KEY;

if (!API_KEY) {
    console.warn('MESSAGEBIRD_API_KEY is not set in environment variables');
}

// Based on debug logs: { initClient: [Function: initClient] }
const mbClient = messagebird.initClient ? messagebird.initClient(API_KEY || 'skip') : messagebird(API_KEY || 'skip');

interface SendSMSParams {
    recipient: string; // e.g., +992927777777
    body: string;
}

export const sendSMS = async ({ recipient, body }: SendSMSParams): Promise<any> => {
    if (!API_KEY) {
        console.error('Cannot send SMS: MESSAGEBIRD_API_KEY is missing');
        throw new Error('MessageBird configuration missing');
    }

    return new Promise((resolve, reject) => {
        mbClient.messages.create(
            {
                originator: 'Dastiyor', // Max 11 alphanumeric chars
                recipients: [recipient],
                body: body,
            },
            (error: Error | null, response: any) => {
                if (error) {
                    console.error('MessageBird Error:', error);
                    reject(error);
                } else {
                    console.log('MessageBird Response:', response);
                    resolve(response);
                }
            }
        );
    });
};
