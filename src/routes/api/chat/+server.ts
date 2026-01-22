import { json, type RequestHandler } from '@sveltejs/kit';
import { invokeAdkAgent, createAdkSession } from '$lib/google-adk/adk-client.js';
import { ADK_APP_NAME, ADK_USER_ID } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger.js';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const userMessage = data.message;
	const sessionId = data.sessionId;
	const isFirstMessage = data.is_first_message;

	const appName = ADK_APP_NAME;
	const userId = ADK_USER_ID;

	if (!appName || !userId) {
		throw new Error('ADK_APP_NAME and ADK_USER_ID must be set in environment variables.');
	}

	if (!sessionId) {
		throw new Error('Session ID is required.');
	}

	try {
		if (isFirstMessage) {
			await createAdkSession(appName, userId, sessionId);
		}

		const agentResponse = await invokeAdkAgent(appName, userId, sessionId, userMessage);

		return json(agentResponse);
	} catch (error) {
		logger.error(error, 'Error invoking ADK agent');
		const errorResponse = error instanceof Error ? error.message : 'An unknown error occurred';
		return new Response(JSON.stringify({ error: errorResponse }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
