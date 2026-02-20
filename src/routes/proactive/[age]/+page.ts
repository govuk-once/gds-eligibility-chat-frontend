import { error } from '@sveltejs/kit';
import { proactiveSystemPrompts } from '$lib/proactive.js';

export function load({ params }) {
    if (Object.keys(proactiveSystemPrompts).includes(params.age)) {
        return {
            age: params.age
        };
    }
    throw error(404, 'Not found');
}