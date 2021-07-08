export const DISCORD_EPOCH = 1_420_070_400_000n;

export function getTimestamp(snowflake: string | bigint): number {
	return Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH);
}
