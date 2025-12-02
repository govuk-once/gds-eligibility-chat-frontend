import 'dotenv/config'; // Explicitly load .env variables
import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';
import { fromIni } from '@aws-sdk/credential-providers';
import { existsSync } from 'node:fs';
import { logger } from '../utils/logger.js';

// Detect whether running in AWS
const isLocal = !(process.env.AWS_EXECUTION_ENV || existsSync('/.dockerenv'));

logger.debug({ isLocal }, 'Initialising BedrockAgentRuntimeClient');

export const bedrockClient = new BedrockAgentRuntimeClient({
	region: process.env.AWS_REGION,
	credentials: isLocal ? fromIni({ profile: process.env.AWS_PROFILE }) : undefined
});
