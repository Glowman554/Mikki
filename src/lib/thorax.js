var base_api = 'https://cloud.glowman554.gq';

let user_cache = undefined;

function user_ok() {}
function premium_ok() {}

export function initialize() {
	return new Promise((resolve, reject) => {
		if (user_cache) {
			resolve(user_cache);
			return;
		}

		if (localStorage.getItem('token')) {
			console.log('Checking user...');

			api_call('/api/user/check').then((e) =>
				e.json().then((e) => {
					if (!e.ok) {
						localStorage.clear();
						location.reload();
					} else {
						user_ok(e);
						if (e.premium) {
							console.log('Detected premium user');
							premium_ok();
						}
						user_cache = e;
						resolve(e);
					}
				})
			);
		} else {
			resolve(undefined);
		}
	});
}

export async function api_call(path, params = undefined, options = undefined) {
	// console.log("API: " + path, params, options);
	let res;
	if (localStorage.getItem('token')) {
		res = await fetch(
			`${base_api}${path}?token=${localStorage.getItem('token')}${params ? '&' + params : ''}`,
			options
		);
	} else {
		res = await fetch(`${base_api}${path}${params ? '?' + params : ''}`, options);
	}

	if (res.status != 200) {
		alert('Fetch for ' + path + ' failed!');
		console.log(await res.text());
		throw new Error();
	}

	return res;
}

export async function login(user, pass) {
	if (user == '' || pass == '') {
		alert('Please input a username & password!');
	} else {
		api_call('/api/user/login', 'username=' + user + '&password=' + pass).then((e) =>
			e.text().then((e) => {
				if (e != 'ERROR') {
					localStorage.setItem('user', user);
					localStorage.setItem('token', e);
					location.reload();
				} else {
					alert('Try again!');
				}
			})
		);
	}
}

export function logout() {
	api_call('/api/user/logout').then((e) =>
		e.text().then((e) => {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			location.reload();
		})
	);
}

export function delete_account() {
	api_call("/api/user/delete").then(e => e.text().then(e => {
		// localStorage.removeItem('token');
		// localStorage.removeItem('user');
		// location.reload();
	}));
}