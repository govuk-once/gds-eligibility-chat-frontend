export type Message = {
	id: string;
	role: 'user' | 'assistant' | 'error';
	text?: string;
	html?: string;
};
