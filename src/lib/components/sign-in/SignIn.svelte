<script lang="ts">
	import { chatState } from '$lib/chat.svelte';

	let username = $state('');
	let password = $state('');

	$effect(() => {
		if (username || password) {
			chatState.pendingActionPayload = JSON.stringify({ username, password });
		} else {
			chatState.pendingActionPayload = undefined;
		}
	});
</script>

<div class="signin-container">
		<div class="field">
			<label for="username">Username:</label>
			<div class="input-wrapper">
				<input type="text" id="username" bind:value={username} autocomplete="username" />
			</div>
		</div>
		<div class="field">
			<label for="password">Password:</label>
			<div class="input-wrapper">
				<input type="password" id="password" bind:value={password} autocomplete="current-password" />
			</div>
		</div>
	</div>

<style>
	.signin-container {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.field {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
	}

	label {
		font-size: 1rem;
		min-width: 5.5em;
	}

	.input-wrapper {
		flex: 1;
		height: 2.75em;
		display: flex;
		align-items: center;
		border: 1px solid #aaaaaa;
		border-radius: 0.5em;
		background-color: white;
		padding: 0 1em;
	}

	input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 1rem;
		height: 100%;
		width: 100%;
		padding: 0;
		font-family: inherit;
	}

	input:focus {
		outline: none;
	}

	.input-wrapper:focus-within {
		border-color: black;
		outline: 1px solid black;
	}
</style>
