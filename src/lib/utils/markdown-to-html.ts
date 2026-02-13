import showdown from 'showdown';
import DOMPurify from 'dompurify';

const converter = new showdown.Converter({ simpleLineBreaks: true });

const TERMS = [
	{ text: 'Personal Independence Payment', url: 'https://www.gov.uk/pip' },
	{ text: 'PIP', url: 'https://www.gov.uk/pip' },
	{ text: 'Universal Credit', url: 'https://www.gov.uk/universal-credit' },
	{ text: 'UC', url: 'https://www.gov.uk/universal-credit' }
];

// Sort longest first to avoid partial matches
const sortedTerms = [...TERMS].sort((a, b) => b.text.length - a.text.length);

export async function markdownToHtml(markdown: string): Promise<string> {
	let html = converter.makeHtml(markdown);

	sortedTerms.forEach(({ text, url }) => {
		const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(?<!href="[^"]*)\\b${escaped}\\b`, 'gi');
		// the negative lookbehind prevents matching inside existing links
		html = html.replace(
			regex,
			(match) => `<b><a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a></b>`
		);
	});

	if (typeof window !== 'undefined') {
		return DOMPurify.sanitize(html);
	} else {
		// server-side
		const sanitizeHtml = (await import('sanitize-html')).default;
		return sanitizeHtml(html);
	}
}
