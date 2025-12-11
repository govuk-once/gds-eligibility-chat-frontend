import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';
import { logger } from '../utils/logger.js';
import { AWS_REGION } from '$env/static/private';

logger.info(`Region: ${AWS_REGION}`);
logger.debug('Initialising BedrockAgentRuntimeClient');

export const bedrockClient = new BedrockAgentRuntimeClient({
	region: AWS_REGION
});
