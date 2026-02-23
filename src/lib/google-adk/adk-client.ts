import { logger } from '../utils/logger.js';
import { env } from '$env/dynamic/public';
import { handleFetchError } from '$lib/utils/handle-fetch-error.js';
import type { AdkAgentResponse } from './adk-types.js';

const baseUrl = env.PUBLIC_ADK_API_URL;

export const updateAdkSession = async (
	appName: string,
	userId: string,
	sessionId: string,
	statePrompt?: string
): Promise<void> => {
	const url = `${baseUrl}/apps/${appName}/users/${userId}/sessions/${sessionId}`;
	const headers = { 'Content-Type': 'application/json' };
	const body = {
		stateDelta: {
			'app:state_prompt': statePrompt
		}
	};

	logger.info({ url, body }, 'Updating ADK Session (PATCH)');

	try {
		const response = await fetch(url, {
			method: 'PATCH',
			headers,
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const errorData = await response.json();
			logger.error({ status: response.status, errorData }, 'ADK Session update failed');
			const detail = errorData.detail?.[0]?.msg || 'Failed to update session';
			throw new Error(`ADK Session update failed: ${response.status} - ${detail}`);
		}

		logger.info({ url }, 'ADK Session updated successfully');
	} catch (err) {
		logger.error(err, 'Failure in ADK Session update');
		throw err;
	}
};

export const createAdkSession = async (
	appName: string,
	userId: string,
	sessionId: string,
	statePrompt?: string
): Promise<void> => {
	const url = `${baseUrl}/apps/${appName}/users/${userId}/sessions/${sessionId}`;
	const headers = { 'Content-Type': 'application/json' };
	const body = statePrompt ? { 'app:state_prompt': statePrompt } : {};

	logger.info({ url }, 'Creating ADK Session');
	logger.info({ body }, 'ADK Session app:state_prompt');

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			// if (response.status === 409) {
			//     logger.info({ url }, 'ADK Session already exists, updating with new prompt');
			//     await updateAdkSession(
			//         appName,
			//         userId,
			//         sessionId,
			//         'Warmly welcome the user back to the service (imagine some time has passed since last interaction), and provide a complete summary of the user information provided so far'
			//     );
			//     return;
			// }
			const errorData = await response.json();
			logger.error({ status: response.status, errorData }, 'ADK Session creation failed');
			const detail = errorData.detail?.[0]?.msg || 'Failed to create session';
			throw new Error(`ADK Session creation failed: ${response.status} - ${detail}`);
		}

		logger.info({ url }, 'ADK Session created successfully');
	} catch (err) {
		logger.error(err, 'Failure in ADK Session creation');
		throw err;
	}
};

export const invokeAdkAgent = async (
	appName: string,
	userId: string,
	sessionId: string,
	userMessage: string
): Promise<AdkAgentResponse> => {
	const url = `${baseUrl}/run`;

	const headers = {
		'Content-Type': 'application/json'
	};

	const bodyPayload = {
		appName,
		userId,
		sessionId,
		newMessage: {
			role: 'user',
			parts: [{ text: userMessage }]
		}
	};
	const body = JSON.stringify(bodyPayload);

	logger.info({ url, body: bodyPayload }, 'Invoking ADK Agent');

	const response = await fetch(url, {
		method: 'POST',
		headers,
		body
	});

	if (!response.ok) {
		await handleFetchError(response);
	}

	const jsonResponse: AdkAgentResponse = await response.json();
	logger.info({ response: jsonResponse }, 'ADK Agent response');
	return jsonResponse;
};
