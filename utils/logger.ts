export class logger {
	// deno-lint-ignore no-explicit-any
	log(...args: any[]) {
		if (Deno.env.get("YEELIGHTTS_DEBUG") !== "true")
			return;
		const timestamp = new Date().toISOString();
		console.log(`[${timestamp}]`, ...args);
	}

	// deno-lint-ignore no-explicit-any
	error(...args: any[]) {
		if (Deno.env.get("YEELIGHTTS_DEBUG") !== "true")
			return;
		const timestamp = new Date().toISOString();
		console.error(`[${timestamp}]`, ...args);
	}

	// deno-lint-ignore no-explicit-any
	warn(...args: any[]) {
		if (Deno.env.get("YEELIGHTTS_DEBUG") !== "true")
			return;
		const timestamp = new Date().toISOString();
		console.warn(`[${timestamp}]`, ...args);
	}

	// deno-lint-ignore no-explicit-any
	info(...args: any[]) {
		if (Deno.env.get("YEELIGHTTS_DEBUG") !== "true")
			return;
		const timestamp = new Date().toISOString();
		console.info(`[${timestamp}]`, ...args);
	}

	// deno-lint-ignore no-explicit-any
	debug(...args: any[]) {
		if (Deno.env.get("YEELIGHTTS_DEBUG") !== "true")
			return;
		const timestamp = new Date().toISOString();
		console.debug(`[${timestamp}]`, ...args);
	}
}

export default new logger();