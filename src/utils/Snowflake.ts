export const DISCORD_EPOCH = 1_420_070_400_000n;

export const SnowflakeRegex = /^\d{17,20}$/;

interface Snowflake {
	timestamp: bigint;
	date: Date;
	workerId: bigint;
	processId: bigint;
	increment: bigint;
}

/**
 * Descontruct a snowflake. **This doesn't check the validity of the snowflake.**
 *
 * @param input A snowflake.
 * @returns The decontructed snowflake or `undefined` if invalid BigInt.
 */
export function deconstruct(input: string): Snowflake | undefined {
	try {
		const snowflake = BigInt(input);
		const timestamp = (snowflake >> 22n) + DISCORD_EPOCH;
		return {
			timestamp,
			date: new Date(Number(timestamp)),
			workerId: (snowflake & 0x3e_00_00n) >> 17n,
			processId: (snowflake & 0x1_f0_00n) >> 12n,
			increment: snowflake & 0xf_ffn,
		};
		// eslint-disable-next-line no-empty
	} catch {}
}
