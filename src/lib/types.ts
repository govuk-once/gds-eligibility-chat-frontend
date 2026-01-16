export type Action = {
	label: string;
	payload: string;
};

export type Message = {

	id: string;

	role: 'user' | 'assistant' | 'error';

	text?: string;

	html?: string;

	markdown?: string;

	actions?: Action[];

	streaming?: boolean;

};
