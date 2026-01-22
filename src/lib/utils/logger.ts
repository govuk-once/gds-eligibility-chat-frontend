import { pino } from 'pino';
import { PINO_LOG_LEVEL } from '$env/dynamic/private';
import { dev } from '$app/environment';

export const logger = pino({
	level: PINO_LOG_LEVEL || 'info',
	transport: dev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true
					//singleLine: true,
				}
			}
		: undefined
});
