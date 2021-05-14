export interface Identifiable<K = unknown> {
	id: K;
}

export interface Patchable {
	$patch(data: unknown): this;
}
