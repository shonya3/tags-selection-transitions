export function startViewTransition(cb: () => void): ViewTransition | null {
	if (!document.startViewTransition) {
		cb();
		return null;
	}

	return document.startViewTransition(cb);
}
