import { logger } from './logger.js';

export async function handleFetchError(response: Response): Promise<never> {
	const raw = await response.text();

	logger.error({ status: response.status, raw }, 'ADK Agent invocation failed (non-OK response)');

	let detail = raw;

	try {
		const data = JSON.parse(raw);

		if (data.detail) {
			if (Array.isArray(data.detail)) {
				detail = data.detail[0]?.msg || JSON.stringify(data.detail);
			} else if (typeof data.detail === 'string') {
				detail = data.detail;
			} else {
				detail = JSON.stringify(data.detail);
			}
		}
	} catch (parseErr) {
		const message = parseErr instanceof Error ? parseErr.message : String(parseErr);
		logger.warn(
			{ parseErrMessage: message },
			'Failed to parse error response as JSON **this is not cause of failure**'
		);
	}

	throw new Error(`ADK Agent invocation failed (${response.status}): ${detail}`);
}
