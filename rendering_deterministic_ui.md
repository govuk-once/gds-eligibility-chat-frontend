# Rendering deterministic UI - how it works

In rendering UI components based on the agent's output, we rely on three things:

1. The user agent which determines what to ask and how, and passes a structured output to:
2. The elicitation agent which confirms the validity of the proposed interaction, and passes a structured output to:
3. The frontend logic which determines the components to render based on the output received from the elicitation agent.

## 1. USER AGENT

Produces structured output which goes to the elicitation agent. The structured output looks like this:

- `content`: this is the string displayed to the user
- `source`: this will be either `benefit_agent` or `user_agent`, indicating whether or not the user agent consulted one of the benefit agents (i.e. the universal credit agent), or whether this is a general conversational interaction with the user agent.
- `expects_reply`: a boolean indicating whether the system expects a response from the user for the current interaction
- `reply_type`: specifies the expected format of user's reply, guiding the UI on which input component to render, these can be:
  - `yes_no`: system expects a binary "Yes" or "No" response.
  - `choice_multiple`: user can select one or more options from a provided list.
  - `choice_single`: user must select exactly one option from a provided list.
  - `free_text`: user can provide any textual input.
  - `none`: no reply is expected (corresponds to `expects_reply: False`).
- `choices`: an optional list of strings that provides options for `choice_multiple` or `choice_single` questions.

### Example Output:

```json
{
	"content": "Do you live in the UK?",
	"source": "benefit_agent",
	"expects_reply": true,
	"reply_type": "yes_no",
	"choices": null
}
```

### Influence by the User Agent Prompt (`user_agent.md`):

The `user_agent.md` prompt acts as a strict guide for the Large Language Model (LLM) powering the user agent, ensuring its output strictly adheres to the output schema and interaction rules.

**Key influences from the prompt:**

- **`source` field control:** The prompt explicitly defines when to set the `source` as `benefit_agent` (e.g., when relaying questions from sub-agents or asking for personal data) versus `user_agent` (for agent-initiated conversational flow or reporting final outcomes).
- **`content` field constraints:**
  - It mandates that `content` must _never_ contain more than one question and always asks only one user question at a time.
  - For `source: "benefit_agent"`, the `content` must be _verbatim_ from the benefit agent's question, preventing the user agent from interpreting or altering it.
  - For `source: "user_agent"`, the `content` must _not_ contain eligibility answers or conclusions, maintaining the user agent's role as a mediator.
- **`reply_type` mapping:** The prompt provides a clear mapping from the nature of the expected user response to the corresponding `reply_type` value. This directly informs the `reply_type` field in the output.
- **`choices` generation (indirectly):** The prompt's "BENEFIT AGENT QUESTION FORMATTING RULES" instruct the agent to extract inline answer choices from benefit agent questions and move them to `choices`.

## 2. ELICITATION AGENT

The elicitation agent acts as a formatting layer, transforming the user agent structured output into an `ElicitationResponse` suitable for display, particularly by converting `choices` into interactive `actions`

The elicitation agent output is identical to the user agent output except the `choices` field is replaced by an `actions` field - this contains a list of objects that look like this:

```
{
    label: string containing text to display on, say, button
    payload: message to send if this option selected - could be more detailed than label, but currently identical
}
```

### Example `ElicitationResponse` Output (derived from the user agent example above):

```json
{
	"content": "Do you live in the UK?",
	"source": "benefit_agent",
	"reply_type": "yes_no",
	"actions": [
		{
			"label": "Yes",
			"payload": "Yes"
		},
		{
			"label": "No",
			"payload": "No"
		}
	]
}
```

### Current Elicitation Agent Rules:

The elicitation agent's prompt provides rigid rules:

- **Input Guarantee:** The elicitation agent is guaranteed to receive input that conforms to the user agent's output schema.
- **Verbatim Pass-through:** The `content` and `source` fields are passed _verbatim_ from the input to the output.
- **`reply_type` Driven `actions` Generation:**
  - If the input `reply_type` is `yes_no`, the agent _must_ create exactly two actions: `{"label": "Yes", "payload": "Yes"}` and `{"label": "No", "payload": "No"}`.
  - If the input `reply_type` is `choice_multiple` or `choice_single`, the agent _must_ use the `choices` from the input to populate the `actions`. Each choice becomes an action where `label` and `payload` are identical to the choice string.
  - If the input `reply_type` is `free_text` or if the input `expects_reply` is `False`, the `actions` field _must_ be `null`.
- **No Inference or New Content:** The prompt strictly forbids the elicitation agent from inferring meaning, intent, or adding any new content. Its role is a pure, rule-based transformation.
- **`emit_elicitation_response` Tool:** The agent uses this tool to ensure the final output strictly adheres to the `ElicitationResponse` schema, including the validation of the `actions` structure.

## 3. FRONTEND RENDERING

### Source = benefit_agent

- If `reply_type` = `choice_single` OR
- If `reply_type` = `yes_no`
  - Displays a RADIO component with choices. Answer will be 'vaulted' (mock)

- If `reply_type` = `choice_multiple`
  - Displays a CHECKLIST component with choices. Answer will be 'vaulted' (mock)
- There is currently some (redundant) fallback logic that if the reply_type is none of the above, and there are actions, it will render these actions as buttons.

- Vaulting logic means the message will have shield icon etc and indicate to user that their message will be stored.

- The mock 'vaulting' logic does not apply if the reply_type is free_text.

### Source = user_agent

- If `reply_type` = `choice_single`
  - Displays a BUTTON or list of BUTTONs depending on length of choices array.
- If `reply_type` = `yes_no`
  - Displays DOUBLE BUTTON component (two buttons on same line)

- CHECKLIST and RADIO BUTTON components are not used by user agent currently.

- No `user_agent` messages display vault icon.
