import 'dotenv/config';
import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';
import { existsSync } from 'node:fs';
import { logger } from '../utils/logger.js';

// Detect whether running in AWS
const isLocal = !(process.env.AWS_EXECUTION_ENV || existsSync('/.dockerenv'));

logger.debug({ isLocal }, 'Initialising BedrockAgentRuntimeClient');

export const bedrockClient = new BedrockAgentRuntimeClient({
	region: process.env.AWS_REGION
});
