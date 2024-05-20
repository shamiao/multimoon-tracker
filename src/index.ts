import * as process from 'node:process';
import * as crypto from 'node:crypto';
import { download, exit } from './common';
import { moon_executable_name, moonc_executable_name, registry_check_update_url, registry_update_url, upstream_core_url, upstream_executable_url, upstream_executables, upstream_script_checksum, upstream_script_url } from './data';
import * as tmp from 'tmp';
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as child_process from 'node:child_process'
import { promisify } from 'node:util'
import { CheckUpdateRep, CheckUpdateReq, UpdateRep, UpdateReq } from './proto/update';
import { Toolchain as PbToolchain, File as PbToolchainFile } from './proto/toolchain';
import pRetry from 'p-retry';

async function main() {
    const arch = process.env.MULTIMOON_ARCH;
    if (arch === undefined) {
        exit("MULTIMOON_ARCH environment variable must be set")
    }

    // fetch and check installation script
    {
        const script_bytes = new Uint8Array(await (await fetch(upstream_script_url(arch))).arrayBuffer())
        const script_checksum = 'sha256:' + crypto.createHash('sha256').update(script_bytes).digest('hex');
        if (script_checksum != upstream_script_checksum(arch)) {
            exit(`upstream MoonBit installation script checksum changed (${script_checksum}) - MultiMoon source code has to change`)
        }
    }

    // download moon & moonc executable only
    // NOTE: existance of `moonc` is mandatory for `moon version`
    const moon_executable = await download(moon_executable_name(arch), upstream_executable_url(arch, moon_executable_name(arch)))
    const moonc_executable = await download(moonc_executable_name(arch), upstream_executable_url(arch, moonc_executable_name(arch)))

    // extract moon & moonc executable and run `moon version`
    const [moon_version_exec, toolchain_version] = await (async () => {
        const tempdir = path.join('temp', crypto.randomBytes(8).toString('hex'));
        await fs.mkdir(tempdir, { recursive: true });
        const moon_exec_path = path.join(tempdir, moon_executable[0])
        {
            await fs.writeFile(moon_exec_path, moon_executable[1]);
            await fs.chmod(moon_exec_path, 0o777);
        }
        {
            const moonc_exec_path = path.join(tempdir, moonc_executable[0])
            await fs.writeFile(moonc_exec_path, moonc_executable[1]);
            await fs.chmod(moonc_exec_path, 0o777);
        }
        const exec_output = await promisify(child_process.execFile)(moon_exec_path, ['version'], {
            env: { "PATH": tempdir }
        });
        const moon_version_exec = exec_output.stdout.split('\n')[0];
        console.log(`moon version: ${moon_version_exec}`);
        const match = (/^moon (\d+\.\d+\.\d+)\s*\([0-9a-f]+\s+\d{4}-\d{1,2}-\d{1,2}\)$/g).exec(moon_version_exec);
        if (match != null) {
            return [moon_version_exec, match[1]]
        } else {
            exit('failed to parse moon version - MultiMoon source code has to change')
        }
    })();
    console.log(`toolchain version: ${toolchain_version}`);

    // access registry: check update
    {
        console.log(`checking if ${arch}/${toolchain_version} in MultiMoon registry...`)
        const req_check_update_pb = CheckUpdateReq.create();
        req_check_update_pb.arch = arch;
        req_check_update_pb.name = toolchain_version;
        const rep_check_update = await fetch(registry_check_update_url(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: CheckUpdateReq.encode(req_check_update_pb).finish(),
        });
        if (!rep_check_update.ok) {
            exit(`error on registry check update: ${rep_check_update.statusText}`);
        }
        const rep_check_update_pb = CheckUpdateRep.decode(new Uint8Array(await rep_check_update.arrayBuffer()));
        if (!rep_check_update_pb.shouldUpdate) {
            console.log(`toolchain ${arch}/${toolchain_version} is already in MultiMoon registry - no need to update.`)
            return;
        } else {
            console.log(`toolchain ${arch}/${toolchain_version} is not in MultiMoon registry.`)
        }
    }
    
    // download other executables and core
    const downloaded_files = await (async () => {
        const download_file_urls = upstream_executables(arch)
            .filter((filename) => {
                return filename != moon_executable_name(arch) && filename != moonc_executable_name(arch)
            })
            .map((exec) => [exec, upstream_executable_url(arch, exec)] as [string, string]);
        download_file_urls.push(['core.zip', upstream_core_url()])
        const download_tasks = download_file_urls.map(([filename, url]) => download(filename, url));
        const downloaded_files = await Promise.all(download_tasks);
        downloaded_files.push(moon_executable);
        downloaded_files.push(moonc_executable);
        return new Map(downloaded_files);
    })();
    
    // access registry: update
    const req_update_pb = await (async () => {
        const req = UpdateReq.create();
        req.arch = arch;
        req.name = toolchain_version;
        req.toolchain = PbToolchain.create();
        req.toolchain.name = toolchain_version;
        req.toolchain.installer = 'initial'
        req.toolchain.lastModified = Math.floor(Date.now() / 1000)
        req.toolchain.moonver = moon_version_exec;
        
        // binaries: sha256 checksum and xz compression
        for (const filename of upstream_executables(arch)) {
            const file_bytes = downloaded_files.get(filename) || exit('internal error, missing downloaded file' );
            const checksum = crypto.createHash('sha256').update(file_bytes).digest('hex');
            const checksum_in_downloadfrom = checksum.substring(0, 8);
            const checksum_in_pb = `sha256:${checksum}`;
            console.log(`${filename} checksum: ${checksum}`)
        
            const lzma: any = require('node-liblzma');
            let compressed: Buffer = await promisify(lzma.xz)(file_bytes, { preset: lzma.LZMA_PRESET_EXTREME });
            console.log(`${filename} size: ${file_bytes.byteLength} bytes (${compressed.byteLength} compressed)`)

            const downloadfrom_filename = `${filename}.${checksum_in_downloadfrom}.xz`

            const file_pb = PbToolchainFile.create();
            file_pb.filename = filename
            file_pb.downloadfrom = downloadfrom_filename
            file_pb.checksum = checksum_in_pb
            file_pb.uploadContent = new Uint8Array(compressed)
            req.toolchain.bin.push(file_pb)
        }
        // core: sha256 checksum only
        for (const filename of ['core.zip']) {
            const file_bytes = downloaded_files.get(filename) || exit('internal error, missing downloaded file' );
            const checksum = crypto.createHash('sha256').update(file_bytes).digest('hex');
            const checksum_in_downloadfrom = checksum.substring(0, 8);
            const checksum_in_pb = `sha256:${checksum}`;
            console.log(`${filename} checksum: ${checksum}`)

            const downloadfrom_filename = `core.${checksum_in_downloadfrom}.zip`

            const file_pb = PbToolchainFile.create();
            file_pb.filename = filename
            file_pb.downloadfrom = downloadfrom_filename
            file_pb.checksum = checksum_in_pb
            file_pb.uploadContent = file_bytes
            req.toolchain.core.push(file_pb)
        }
        return req;
    })();
    {
        const rep_fetch = async (attempt: number) => {
            console.log(`uploading ${req_update_pb.arch}/${req_update_pb.name} to registry... (attempt: ${attempt})`)
            const rep_update = await fetch(registry_update_url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: UpdateReq.encode(req_update_pb).finish(),
            });
            if (rep_update.ok) {
                return rep_update;
            } else {
                throw new Error(`error on registry update: ${rep_update.statusText}`)
            }
        };
        const rep_update = await pRetry(rep_fetch, {
            onFailedAttempt: error => {
                console.log(`attempt ${error.attemptNumber} failed. (${error.retriesLeft} attempts left)`);
            },
            retries: 5
        });
        const _rep_update_pb = UpdateRep.decode(new Uint8Array(await rep_update.arrayBuffer()));
        console.log(`sucessfully uploaded ${req_update_pb.arch}/${req_update_pb.name} to registry.`)
    }
}

main()
