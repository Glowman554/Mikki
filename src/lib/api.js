import { api_call } from './thorax';

export async function wiki_create(page_title, page_text) {
	const res = await api_call('/api/wiki/create', undefined, {
		method: 'POST',
		body: JSON.stringify({
			id: -1,
			name: page_title,
			text: page_text,
			username: 'glowman554' // TODO
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

export async function wiki_edit(token, page_id, page_title, page_text) {
	var page_title_encoded = btoa(
		encodeURIComponent(process_escapes(page_title)).replace(/%0[aA]/g, '\n')
	);
	var page_text_encoded = btoa(
		encodeURIComponent(process_escapes(page_text)).replace(/%0[aA]/g, '\n')
	);

	const res = await fetch(
		base_api +
			'/wiki/page/edit?token=' +
			token +
			'&page_id=' +
			page_id +
			'&page_title=' +
			page_title_encoded,
		{
			method: 'POST',
			body: page_text_encoded
		}
	);
	let data = await res.text();
	throw_if_error_txt(data);
	return process_response(data);
}

export async function wiki_list() {
	if (navigator.onLine) {
		return (await api_call('/api/wiki/list')).json();
	} else {
		return JSON.parse(localStorage.getItem('page_list')) || [];
	}
}

export async function wiki_delete(token, page_id) {
	const res = await fetch(base_api + '/wiki/page/delete?token=' + token + '&page_id=' + page_id);
	var json = await res.json();
	throw_if_error(json);
	return json;
}

export async function wiki_changelog() {
	if (navigator.onLine) {
		const res = await fetch(base_api + '/wiki/page/changelog');
		let data = await res.text();
		throw_if_error_txt(data);
		return process_response(data);
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
	// localStorage.setItem("page_changelog", JSON.stringify(await wiki_changelog()));
}
