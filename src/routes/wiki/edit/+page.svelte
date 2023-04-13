<script>
	import { wiki_edit, wiki_get } from '$lib/api.js';
	import { redirect, toBase64 } from '$lib/helper.js';
	import { onMount } from 'svelte';
	import { initialize } from '$lib/thorax.js';

	let id = '';
	let page = {
		name: '',
		text: ''
	};

	onMount(() => {
		id = window.location.hash.substr(1);
		wiki_get(id).then((res) => {
			page = res;
			console.log(page);
		});
	});

	let disabled = '';

	const save = () => {
		if (page.name !== '') {
			initialize().then((user) => {
				if (!user) {
					alert('Sie müssen eingeloggt sein, um zu speichern.');
					return;
				}
				if (!user.admin) {
					alert('Sie müssen Wiki Editor sein um diese Seite zu bearbeiten.');
					return;
				}
				wiki_edit(page.id, page.name, page.text)
					.then(() => {
						disabled = 'disabled';
						redirect('/');
					})
					.catch((e) => {
						alert('Ups, die Datei konnte nicht gespeichert werden! Vielleicht ist sie zu groß?');
					});
			});
		} else {
			alert('Der Titel darf nicht leer sein.');
		}
	};

	var picture_proggress = 0;
	var picture_proggress_show = false;

	function on_picture_upload() {
		var element = document.getElementById('uploaded_picture');

		if (element.files.length !== 1) {
			alert('Bitte wählen sie nur eine Datei aus.');
			delete element.files;
		} else {
			toBase64(element.files[0], (progress) => {
				picture_proggress = progress;
				picture_proggress_show = true;
			}).then((res) => {
				// console.log(res);
				picture_proggress_show = false;

				var textarea = document.getElementById('editor');

				var tmp =
					textarea.value.slice(0, textarea.selectionStart) +
					`![${element.files[0].name}](${res})\n` +
					textarea.value.slice(textarea.selectionStart);
				textarea.value = tmp;
				page.text = tmp;
				textarea.focus();

				delete element.files;
			});
		}
	}
</script>

<svelte:head>
	<title>Wiki - Bearbeiten</title>
</svelte:head>

<body>
	<h2>Edit Page</h2>
	<input type="text" placeholder="titel" bind:value={page.name} />
	<textarea id="editor" placeholder="text" resi bind:value={page.text} />
	<button type="submit" on:click={save} {disabled}>Speichern</button>
	<button onclick="document.getElementById('uploaded_picture').click();">Bild hohchladen</button>

	<input
		type="file"
		style="display: none"
		id="uploaded_picture"
		maxlength="1"
		name="file"
		on:change={on_picture_upload}
	/>

	{#if picture_proggress_show}
		<progress max="100" value={picture_proggress} />
	{/if}
</body>

<style>
	button {
		font-size: larger;
		background-color: var(--light-background);
		padding: 5px;
		color: white;
		text-decoration: underline;
		margin: 1rem;
		border: none;
		background: none;
		font-weight: bold;
	}

	button:hover {
		cursor: pointer;
	}

	input {
		width: 90%;
		margin: 0.5rem;
		border-radius: 1rem;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		border: none;
		font-size: large;
	}

	textarea {
		width: 90%;
		font-size: larger;
		height: 50vh;
		border-radius: 1rem;
		resize: none;
		padding: 0.5rem;
		border: none;
	}
</style>
