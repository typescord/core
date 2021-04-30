export class GatewayException extends Error {
	public constructor(public readonly closeCode: number, message?: string) {
		super(message);
		this.name = `GatewayException [${closeCode}]`;
		Error.captureStackTrace(this, GatewayException);
	}
}
