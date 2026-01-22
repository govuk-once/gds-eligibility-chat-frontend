import { pino } from 'pino';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export const logger = pino({
	level: env.PINO_LOG_LEVEL || 'info',
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
