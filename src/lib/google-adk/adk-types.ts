
interface AdkPart {
	text: string;
}

interface AdkContent {
	role: 'model' | 'user';
	parts: AdkPart[];
}

export interface AdkAgentResponseEvent {
	content?: AdkContent;
	// There might be other properties in the event, but we only care about content for now.
	[key: string]: unknown;
}

export type AdkAgentResponse = AdkAgentResponseEvent[];
