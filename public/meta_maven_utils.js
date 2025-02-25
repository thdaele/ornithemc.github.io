const URL = "ornithemc.net";
const META = "meta." + URL;
const VERSION = "v3";

function makeMetaUrl(...pathComponents) {
    let url = META + "/" + VERSION;
    for (const pathComponent of pathComponents) {
        url += "/";
        url += pathComponent;
    }
    return "https://" + url;
}

async function getFromMeta(...pathComponents) {
    const response = await fetch(makeMetaUrl(...pathComponents));
    return response.json();
}

async function getMinecraftVersionsMeta() {
    return await getFromMeta("versions", "game");
}

async function getFeatherVersionMeta(mcVersion) {
    return await getFromMeta("versions", "feather", mcVersion);
}

async function getRavenVersionMeta(mcVersion) {
    return await getFromMeta("versions", "raven", mcVersion);
}

async function getSparrowVersionMeta(mcVersion) {
    return await getFromMeta("versions", "sparrow", mcVersion);
}

async function getNestsVersionMeta(mcVersion) {
    return await getFromMeta("versions", "nests", mcVersion);
}

async function getLoaderVersionsMeta(loader) {
    return await getFromMeta("versions", loader + "-loader");
}

async function getOslVersionsMeta() {
    return await getFromMeta("versions", "osl");
}

function compareVersion(sv1, sv2) {
    function rec(v1, v2) {
        if (v1.length === 0 && v2.length === 0) return 0;
        if (v1.length === 0) return 1;
        if (v2.length === 0) return -1;
        const [head1, ...tail1] = v1;
        const [head2, ...tail2] = v2;
        const ih1 = parseInt(head1);
        const ih2 = parseInt(head2);
        if (ih1 < ih2) return 1;
        if (ih1 > ih2) return -1;
        return rec(tail1, tail2);
    }

    return rec(sv1.split("."), sv2.split("."));
}

export async function getMinecraftVersions() {
    return await getMinecraftVersionsMeta()
        .then(l => l.map(v => v.version));
}

export async function getMinecraftStableVersions() {
    return await getMinecraftVersionsMeta()
        .then(l => l.filter(v => v.stable))
        .then(l => l.map(v => v.version));
}

export async function getLatestFeatherBuild(mcVersion) {
    return await getFeatherVersionMeta(mcVersion)
        .then(l => l.sort((e1, e2) => e2.build - e1.build))
        .then(s => { console.log(s); return s; })
        .then(([head, ..._]) => head)
        .then(e => e !== undefined ? e.build : null);
}

export async function getLatestRavenBuild(mcVersion) {
    return await getRavenVersionMeta(mcVersion)
        .then(l => l.sort((e1, e2) => e2.build - e1.build))
        .then(([head, ..._]) => head)
        .then(e => e !== undefined ? e.build : null);
}

export async function getLatestSparrowBuild(mcVersion) {
    return await getSparrowVersionMeta(mcVersion)
        .then(l => l.sort((e1, e2) => e2.build - e1.build))
        .then(([head, ..._]) => head)
        .then(e => e !== undefined ? e.build : null);
}

export async function getLatestNestsBuild(mcVersion) {
    return await getNestsVersionMeta(mcVersion)
        .then(l => l.sort((e1, e2) => e2.build - e1.build))
        .then(([head, ..._]) => head)
        .then(e => e !== undefined ? e.build : null);
}

export async function getLatestLoader(loader) {
    return await getLoaderVersionsMeta(loader)
        .then(l => l.filter(e => e.stable))
        .then(([head, ..._]) => head)
        .then(e => e.version);
}

export async function getLatestOsl() {
    return await getOslVersionsMeta()
        .then(l => l.sort((e1, e2) => compareVersion(e1.version, e2.version)))
        .then(([head, ..._]) => head)
        .then(e => e.version);
}