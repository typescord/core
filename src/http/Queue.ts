export class Queue {
	private readonly promises: { promise: Promise<void>; resolve: () => void }[] = [];

	public get length(): number {
		return this.promises.length;
	}

	public wait(): Promise<void> {
		let resolve!: () => void;
		const promise = new Promise<void>(($resolve) => {
			resolve = $resolve;
		});

		this.promises.push({ promise, resolve });

		return this.promises.length > 1 ? this.promises[this.promises.length - 2].promise : Promise.resolve();
	}

	public shift(): void {
		this.promises.shift()?.resolve();
	}
}
