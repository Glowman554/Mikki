import { api_call } from './thorax';

export async function wiki_create(name, text) {
	const res = await api_call('/api/wiki/create', undefined, {
		method: 'POST',
		body: JSON.stringify({
			id: -1,
			name: name,
			text: text,
			username: localStorage.getItem("user")
		})
	});
	let data = await res.text();
	return data;
}

export async function wiki_get(id, wiki_list = []) {
	if (navigator.onLine) {
		let maybe_cached = localStorage.getItem('page_' + id);
		if (maybe_cached) {
			return JSON.parse(maybe_cached);
		}
		const res = await api_call('/api/wiki/get', 'id=' + id);
		let data = await res.json();
		return data;
	} else {
		return JSON.parse(localStorage.getItem('page_' + id));
	}
}

export async function wiki_get_download(page_id) {
	throw new Error('no');
}

export async function wiki_edit(page_id, name, text) {
	const res = await api_call('/api/wiki/update', undefined, {
		method: 'POST',
		body: JSON.stringify({
			id: page_id,
			name: name,
			text: text,
			username: localStorage.getItem("user")
		})
	});
	let data = await res.text();
	return data;
}

export async function wiki_list() {
	if (navigator.onLine) {
		return (await api_call('/api/wiki/list')).json();
	} else {
		return JSON.parse(localStorage.getItem('page_list')) || [];
	}
}

export async function wiki_delete(page_id) {
	return (await api_call("/api/wiki/delete", "id=" + page_id)).text();
}

export async function wiki_changelog() {
	if (navigator.onLine) {
		return (await api_call("/api/wiki/changes")).json();
	} else {
		return JSON.parse(localStorage.getItem('page_changelog'));
	}
}

export async function wiki_cache(progress_callback) {
	let last_sync = localStorage.getItem('page_last_cache');
	if (last_sync) {
		if (last_sync == '-1') {
			console.warn('Always running cache update (DEBUG ONLY)');
		} else {
			last_sync = new Date(parseInt(last_sync));
			let now = new Date();
			if (now.getTime() - last_sync.getTime() < 1000 * 60 * 5) {
				console.log('skipping cache update because last one was less than 5 minutes ago');
				return;
			}

			localStorage.setItem('page_last_cache', now.getTime());
		}
	} else {
		localStorage.setItem('page_last_cache', new Date().getTime());
	}

	for (let item in localStorage) {
		if (item.match(/page_[0-9]+/g)) {
			localStorage.removeItem(item);
			console.log('removed ' + item);
		}
	}

	let current_pages = await wiki_list();

	for (let i = 0; i < current_pages.length; i++) {
		progress_callback(i, current_pages.length);
		localStorage.setItem(
			'page_' + current_pages[i].id,
			JSON.stringify(await wiki_get(current_pages[i].id))
		);
	}

	localStorage.setItem('page_list', JSON.stringify(current_pages));
	// TODO
	localStorage.setItem("page_changelog", JSON.stringify(await wiki_changelog()));
}
