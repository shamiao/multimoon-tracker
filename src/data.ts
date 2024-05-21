import { exit } from './common';

export function upstream_script_url(arch: string): string {
    switch (arch) {
        case 'macos_aarch64': return 'https://cli.moonbitlang.com/mac_m1_moon_setup.sh';
        case 'macos_amd64': return 'https://cli.moonbitlang.com/mac_intel_moon_setup.sh';
        case 'ubuntu_amd64': return 'https://cli.moonbitlang.com/ubuntu_x86_64_moon_setup.sh';
        case 'windows_x64': return 'https://cli.moonbitlang.com/windows_moon_setup.ps1';
        default: exit(`arch ${arch} unsupported`);
    }
}

export function upstream_script_checksum(arch: string): string {
    switch (arch) {
        case 'macos_aarch64': return 'sha256:c1693f838ae7ab338645ca77beb9b906dbab3a6fabcbfea91a128c4a89ca5900';
        case 'macos_amd64': return 'sha256:8b20338385cfb64452ffcaa15ddc6ca1bef5f6d165322eaeb192ec22e38591f5';
        case 'ubuntu_amd64': return 'sha256:847c6d2faf3070af1f3cb6d9cd96c6fc1d03f858e6f607015a2fa9c6833cd7c4';
        case 'windows_x64': return 'sha256:d0c0869e22661c08a795ab41f8e021cf66931b45c20220f742650010e035a54a';
        default: exit(`arch ${arch} unsupported`);
    }
}

export function upstream_executables(arch: string): string[] {
    switch (arch) {
        case 'macos_aarch64':
        case 'macos_amd64':
        case 'ubuntu_amd64':
            return ['moon', 'moonc', 'moonfmt', 'moonrun', 'moondoc', 'mooninfo', 'moon_cove_report'];
        case 'windows_x64':
            return ['moon', 'moonc', 'moonfmt', 'moonrun', 'moondoc', 'mooninfo', 'moon_cove_report'].map((s) => {
                return `${s}.exe`;
            });
        default: exit(`arch ${arch} unsupported`);
    }
}

export function upstream_executable_url(arch: string, exec: string): string {
    switch (arch) {
        case 'macos_aarch64': return `https://cli.moonbitlang.com/macos_m1/${exec}`;
        case 'macos_amd64': return `https://cli.moonbitlang.com/macos_intel/${exec}`;
        case 'ubuntu_amd64': return `https://cli.moonbitlang.com/ubuntu_x86/${exec}`;
        case 'windows_x64': return `https://cli.moonbitlang.com/windows/${exec}`;
        default: exit(`arch ${arch} unsupported`);
    }
}

export function upstream_core_url(): string {
    return 'https://cli.moonbitlang.com/core.zip'
}

export function moon_executable_name(arch: string): string {
    switch (arch) {
        case 'macos_aarch64':
        case 'macos_amd64':
        case 'ubuntu_amd64':
            return 'moon';
        case 'windows_x64':
            return 'moon.exe';
        default: exit(`arch ${arch} unsupported`);
    }
}

export function moonc_executable_name(arch: string): string {
    switch (arch) {
        case 'macos_aarch64':
        case 'macos_amd64':
        case 'ubuntu_amd64':
            return 'moonc';
        case 'windows_x64':
            return 'moonc.exe';
        default: exit(`arch ${arch} unsupported`);
    }
}

export function registry_check_update_url(): string {
    return 'http://multimoon.lopt.dev/update/check'
}

export function registry_update_url(): string {
    return 'http://multimoon.lopt.dev/update'
}

export function registry_upload_file_url(): string {
    return 'http://multimoon.lopt.dev/update/upload'
}
