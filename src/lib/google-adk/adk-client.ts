import { logger } from '../utils/logger.js';
import { PUBLIC_ADK_API_URL } from '$env/static/public';
import { handleFetchError } from '$lib/utils/handle-fetch-error.js';
import type { AdkAgentResponse } from './adk-types.js';

if (!PUBLIC_ADK_API_URL) {
	throw new Error('PUBLIC_ADK_API_URL is not set');
}

const ADK_API_BASE_URL = PUBLIC_ADK_API_URL;

export const createAdkSession = async (
	appName: string,
	userId: string,
	sessionId: string
): Promise<void> => {
	const url = `${ADK_API_BASE_URL}/apps/${appName}/users/${userId}/sessions/${sessionId}`;
	const headers = { 'Content-Type': 'application/json' };

	logger.info({ url }, 'Creating ADK Session');

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({})
		});

		if (!response.ok) {
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
	const url = `${ADK_API_BASE_URL}/run`;

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

	logger.info({ url, body: bodyPayload }, 'Invoking ADK Agent (non-streaming)');

	const response = await fetch(url, {
		method: 'POST',
		headers,
		body
	});

	if (!response.ok) {
		await handleFetchError(response)
	}

	const jsonResponse: AdkAgentResponse = await response.json();
	logger.info({ response: jsonResponse }, 'ADK Agent response');
	return jsonResponse
};

