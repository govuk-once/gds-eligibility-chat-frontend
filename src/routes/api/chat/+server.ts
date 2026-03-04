import { json, type RequestHandler } from '@sveltejs/kit';
import { invokeAdkAgent, createAdkSession, updateAdkSession } from '$lib/google-adk/adk-client.js';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger.js';
import { proactiveSystemPrompts } from '$lib/prompts.js';
import type { ChatSessionConfig } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const userMessage = data.message;
	const sessionId = data.sessionId;
	const isFirstMessage = data.is_first_message;
	const config = data.config as ChatSessionConfig;

	const isProactive = config?.isProactive ?? false;
	const isChildBenefit = config?.isChildBenefit ?? false;
	const ageGroup = config?.ageGroup;

	let appName = env.ADK_APP_NAME;

	if (isChildBenefit) {
		appName = env.CHILD_BENEFIT_ADK_APP_NAME;
	} else if (isProactive) {
		appName = env.PROACTIVE_ADK_APP_NAME;
	}

	const userId = env.ADK_USER_ID;

	if (!appName || !userId) {
		throw new Error(
			'ADK_APP_NAME, PROACTIVE_ADK_APP_NAME, CHILD_BENEFIT_ADK_APP_NAME and ADK_USER_ID must be set in environment variables.'
		);
	}

	if (!sessionId) {
		throw new Error('Session ID is required.');
	}

	try {
		if (isProactive && ageGroup) {
			const statePrompt = proactiveSystemPrompts[ageGroup];

			if (isFirstMessage) {
				try {
					await createAdkSession(appName, userId, sessionId, statePrompt);
				} catch (err: any) {
					// Handle "already exists"
					if (err?.message?.includes('409')) {
						logger.info('Session already exists, updating instead');
						await updateAdkSession(appName, userId, sessionId, statePrompt);
					} else {
						throw err;
					}
				}
			} else {
				// For proactive routes, we update the session prompt on every message to ensure context
				logger.info(`Updating session prompt to ${ageGroup}`);
				await updateAdkSession(appName, userId, sessionId, statePrompt);
			}
		} else if (isFirstMessage) {
			await createAdkSession(appName, userId, sessionId);
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
