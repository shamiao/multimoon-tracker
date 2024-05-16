import * as process from 'node:process';

export function exit(msg: string): never {
    process.stderr.write(`error: ${msg}\n`)
    process.exit(1)
}
