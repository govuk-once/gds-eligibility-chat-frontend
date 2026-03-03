export type Action = {
	label: string;
	payload: string;
};

export type Message = {
	id: string;

	role: 'user' | 'assistant' | 'error';

	source?: 'user_agent' | 'benefit_agent';

	reply_type?: 'yes_no' | 'choice_multiple' | 'choice_single' | 'free_text' | 'none';

	text?: string;

	html?: string;

	markdown?: string;

	actions?: Action[];

	streaming?: boolean;

	vault?: boolean;
};

export interface ChatSessionConfig {
	isProactive: boolean;
	ageGroup?: string;
	isChildBenefit?: boolean;
}

export interface ChatContext {
	config: ChatSessionConfig;
	sessionId?: string;
}
