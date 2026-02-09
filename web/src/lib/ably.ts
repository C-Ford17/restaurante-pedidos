
import Ably from 'ably';

let ably: Ably.Realtime | null = null;

if (process.env.ABLY_API_KEY) {
    ably = new Ably.Realtime(process.env.ABLY_API_KEY);
}

export const publishOrderUpdate = async (organizationId: string, eventName: string, data: any) => {
    if (!ably) {
        // console.warn('Ably API key not found, skipping real-time update'); 
        return;
    }

    try {
        const channel = ably.channels.get(`orders:${organizationId}`);
        await channel.publish(eventName, data);
    } catch (error) {
        console.error('Error publishing Ably message:', error);
    }
};
