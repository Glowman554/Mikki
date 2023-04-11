<script>
	import { dateToString } from '$lib/helper';
	import { onMount } from 'svelte';
	import { wiki_changelog } from '$lib/api';

	let changelog = [];

	onMount(async () => {
		changelog = await wiki_changelog();
	});

	function changeToString(change) {
		console.log(change)
		switch (change.change) {
			case "create":
				return `${change.username} hat ${change.title} erstelt!`;
			case "change":
				return `${change.username} hat ${change.title} geändert!`;
		}
	}
</script>

<svelte:head>
	<title>Wiki - Log</title>
</svelte:head>

<body>
	<h2>Wiki Änderungen</h2>

	<div class="changelog_list">
		<table>
			<tr>
				<th>Änderungen</th>
				<th>Zeitpunkt</th>
			</tr>

			{#each changelog as entry}
				<tr>
					<td>{changeToString(entry)}</td>
					<td>{dateToString(entry.timestamp)}</td>
				</tr>
			{/each}
		</table>
	</div>
</body>

<style>
	body {
		margin: 0 1rem;
	}

	.changelog_list {
		background-color: var(--light-background);
		border-radius: 0.5rem;
		margin: 1rem 0;
		padding: 0.8rem 0;
		overflow-x: auto;
	}

	.changelog_list table {
		width: 100%;
		margin: 1rem 0;
		text-align: left;
		padding: 0 1rem;
	}

	th {
		font-weight: bold;
		font-size: 2rem;
	}

	.changelog_list td,
	th {
		padding: 8px;
	}

	tr:nth-child(even) {
		background-color: var(--background);
	}
</style>
