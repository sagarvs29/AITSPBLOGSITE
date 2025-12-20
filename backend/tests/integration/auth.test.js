// Integration smoke test for Auth + Profile + Directory
// Requires the dev server to be running on PORT (default 5000)

const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

async function req(method, path, body, token) {
	const res = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	const text = await res.text();
	let json;
	try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
	if (!res.ok) {
		throw new Error(`${method} ${path} -> ${res.status} ${res.statusText} ${text}`);
	}
	return json;
}

async function main() {
	const email = "user1@example.com";
	const password = "secret123";

	// 1) Register (idempotent for dev; 409 means already exists)
	try {
		const r = await req("POST", "/api/auth/register", { email, password, name: "User One" });
		console.log("[register]", r);
	} catch (e) {
		if (!String(e.message).includes("409")) throw e;
		console.log("[register] user exists (409), continuing...");
	}

	// 2) Login
	const login = await req("POST", "/api/auth/login", { email, password });
	console.log("[login]", login);
	const token = login?.data?.token;
	if (!token) throw new Error("No token returned from login");

	// 3) Me
	const me = await req("GET", "/api/auth/me", null, token);
	console.log("[me]", me);

	// 4) Update profile
	const upd = await req("PUT", "/api/users/me", { name: "User One", bio: "Hello there", visibility: "PUBLIC" }, token);
	console.log("[profile update]", upd);

	// 5) Directory
	const dir = await req("GET", "/api/users/directory?q=user&page=1&limit=5");
	console.log("[directory]", dir);

	console.log("ALL GOOD ✅");
}

main().catch((err) => { console.error("TEST FAILED ❌", err.message); process.exit(1); });
