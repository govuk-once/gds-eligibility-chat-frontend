import { pino } from 'pino';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const level = env.PINO_LOG_LEVEL ?? ( dev ? 'debug' : 'info')

export const logger = pino({
	level,
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
