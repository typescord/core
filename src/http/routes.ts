/* import type * as dapi from 'discord-api-types/rest/v8';
import type { Snowflake } from 'discord-api-types';
import type { BaseRequestOptions } from '.';

// JSON RequestOptions
interface JRO<T> extends BaseRequestOptions {
	json?: T;
}

// Query RequestOptions
interface QRO<T> extends BaseRequestOptions {
	query?: T;
}

// Files RequestOptions
interface FRO extends BaseRequestOptions {
	files?: any;
}

// JSONQuery RequestOptions
interface JQRO<J, Q> extends JRO<J>, QRO<Q> {}

// JSONQueryFiles RequestOptions
interface JQFRO<J, Q> extends JRO<J>, QRO<Q>, FRO {}

// JSONFiles RequestOptions
interface JFRO<J> extends JRO<J>, FRO {} */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Routes {}
