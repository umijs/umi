export interface Options {
	/**
	Set to `false` to avoid spawning subprocesses and instead only resolve the locale from environment variables.

	@default true
	*/
	readonly spawn?: boolean;
}

/**
Get the system [locale](https://en.wikipedia.org/wiki/Locale_(computer_software)).

@returns The locale.

@example
```
import {osLocale} from './os-locale';

console.log(await osLocale());
//=> 'en-US'
```
*/
export function osLocale(options?: Options): Promise<string>;

/**
Synchronously get the system [locale](https://en.wikipedia.org/wiki/Locale_(computer_software)).

@returns The locale.

@example
```
import {osLocaleSync} from './os-locale';

console.log(osLocaleSync());
//=> 'en-US'
```
*/
export function osLocaleSync(options?: Options): string;
