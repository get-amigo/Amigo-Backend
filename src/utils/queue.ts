import { Client, Receiver } from "@upstash/qstash";

export const pushToNotificationQueue = async (data: string) => {
    const client = new Client({
        token: process.env.QSTASH_TOKEN,
    });

    await client.publish({
        url: process.env.QSTASH_PUBLISH_URL,
        body: data,
    });

};

export const verifyNotificationQueuePayload = async ({ signature, body }: { signature: string, body: string }) => {
    try {
        const receiver = new Receiver({
            currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
            nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
        });
        
        const message = await receiver.verify({ signature, body });
        
        return message;
    } catch (error) {
        console.log('Error verifying payload', error);
        return false;
    }
};
