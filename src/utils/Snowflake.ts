export const DISCORD_EPOCH = 1_420_070_400_000n;

export const SnowflakeRegex = /^\d{17,20}$/;

export interface Snowflake<T extends number | bigint = number> {
	timestamp: T;
	date: Date;
	workerId: T;
	processId: T;
	increment: T;
	$raw: Omit<Snowflake<bigint>, 'date' | '$raw'>;
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
			const workerId = (snowflake & 0x3e_00_00n) >> 17n;
			const processId = (snowflake & 0x1_f0_00n) >> 12n;
			const increment = snowflake & 0xf_ffn;

			return {
					timestamp: Number(timestamp),
					date: new Date(Number(timestamp)),
					workerId: Number(workerId),
					processId: Number(processId),
					increment: Number(increment),
					$raw: { timestamp, workerId, processId, increment },
			};
			// eslint-disable-next-line no-empty
	} catch {}
}
