import * as process from 'node:process';

export function exit(msg: string): never {
    process.stderr.write(`error: ${msg}\n`)
    process.exit(1)
}

export async function download(filename: string, url: string): Promise<[string, Uint8Array]> {
    console.log(`downloading ${url}`);
    const t0 = performance.now()
    const response = await fetch(url);
    const duration = (performance.now() - t0) / 1000.0;
    if (!response.ok) {
        exit(`error downloading ${url}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const speed_kib_s = buffer.byteLength / duration / 1024.0;
    console.log(`downloaded ${url} (${speed_kib_s.toFixed(2)} KiB/s)`);
    return [filename, new Uint8Array(buffer)] as [string, Uint8Array];
}
