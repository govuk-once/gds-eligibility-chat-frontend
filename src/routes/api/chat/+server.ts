import { json, type RequestHandler } from '@sveltejs/kit';
import { invokeAdkAgent, createAdkSession } from '$lib/google-adk/adk-client.js';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger.js';
import { proactiveSystemPrompts } from '$lib/prompts.js';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    const userMessage = data.message;
    const sessionId = data.sessionId;
    const isFirstMessage = data.is_first_message;

    const referer = request.headers.get('referer');
    const isProactive = referer?.includes('/proactive/');

    const appName = isProactive ? env.PROACTIVE_ADK_APP_NAME : env.ADK_APP_NAME;
    const userId = env.ADK_USER_ID;

    if (!appName || !userId) {
        throw new Error('ADK_APP_NAME, PROACTIVE_ADK_APP_NAME and ADK_USER_ID must be set in environment variables.');
    }

    if (!sessionId) {
        throw new Error('Session ID is required.');
    }

    try {
        if (isFirstMessage) {
            let statePrompt: string | undefined = undefined;
            if (isProactive) {
                const ageGroup = referer?.split('/').pop() || '';
                statePrompt = proactiveSystemPrompts[ageGroup];
            }
            await createAdkSession(appName, userId, sessionId, statePrompt);
        }

        let messageToAgent = userMessage;
        if (isProactive && isFirstMessage) {
            messageToAgent = '';
        }

        const agentResponse = await invokeAdkAgent(appName, userId, sessionId, messageToAgent);

        const responsePayload = {
            response: agentResponse,
            isProactiveInitial: isProactive && isFirstMessage
        };

        return json(responsePayload);
    } catch (error) {
        logger.error(error, 'Error invoking ADK agent');
        const errorResponse = error instanceof Error ? error.message : 'An unknown error occurred';
        return new Response(JSON.stringify({ error: errorResponse }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
