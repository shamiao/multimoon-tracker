import * as process from 'node:process';
import * as crypto from 'node:crypto';
import { exit } from './common';
import { moon_executable_name, upstream_core_url, upstream_executable_url, upstream_executables, upstream_script_checksum, upstream_script_url } from './data';
import * as tmp from 'tmp';
import * as fs from 'node:fs/promises'
import * as child_process from 'node:child_process'
import { promisify } from 'node:util'

async function main() {
    const arch = process.env.MULTIMOON_ARCH;
    if (arch === undefined) {
        exit("MULTIMOON_ARCH environment variable must be set")
    }

    // fetch and check installation script
    {
        const script_bytes = new Uint8Array(await (await fetch(upstream_script_url(arch))).arrayBuffer())
        const hash = crypto.createHash('sha256')
        hash.write(script_bytes)
        const script_checksum = 'sha256:' + hash.digest('hex');
        if (script_checksum != upstream_script_checksum(arch)) {
            exit(`upstream MoonBit installation script checksum changed (${script_checksum}) - MultiMoon source code has to change`)
        }
    }

    // download executables and core
    const downloaded_files = await (async () => {
        const download_file_urls = upstream_executables(arch)
            .map((exec) => [exec, upstream_executable_url(arch, exec)] as [string, string]);
        download_file_urls.push(['core.zip', upstream_core_url()])
        const download_tasks = download_file_urls.map(async ([filename, url]) => {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            return [filename, new Uint8Array(buffer)] as [string, Uint8Array];
        });
        return new Map(await Promise.all(download_tasks));
    })()
    

    // extract `moon` executable and run `moon version`
    const moon_version = await (async () => {
        const moon_exec_content = downloaded_files.get(moon_executable_name(arch));
        if (moon_exec_content === undefined) {
            exit("moon executable not found in downloaded files")
        }
        const tempfile = await new Promise<string>((resolve, reject) => {
            tmp.file(
                {
                    mode: 0o755, 
                    prefix: 'multimoon-tracker', 
                    postfix: moon_executable_name(arch),
                    discardDescriptor: true,
                }, 
                (err, name, fd) => {
                    if (err == null) {
                        resolve(name);
                    } else {
                        reject(err);
                    }
                }
            );
        });
        await fs.writeFile(tempfile, moon_exec_content);
        console.log(tempfile, moon_exec_content.length);
        let version = await promisify(child_process.execFile)(tempfile, ['version']);
        console.log(version);
    })();



    console.log(upstream_executables("windows_x64"))
}

main()
