import {
    getMinecraftStableVersions,
    getMinecraftVersions,
    getLatestLoader,
    getLatestOsl,
    getLatestFeatherBuild,
    getLatestRavenBuild,
    getLatestSparrowBuild,
    getLatestNestsBuild
} from "./meta_maven_utils.js";

(async () => {
    const minecraftStableVersions = await getMinecraftStableVersions();
    const minecraftAllVersions = await getMinecraftVersions();

    let possibleVersions;

    const loaderSelectorRadios = { fabric: document.getElementById("mod-loader-fabric"), quilt: document.getElementById("mod-loader-quilt") }
    const versionSelectorInput = document.getElementById("mc-version");
    const versionListElement = document.getElementById("version-list");
    const allowSnapshotsCheck = document.getElementById("allow-snapshots");

    function setExtraMsg(message) {
        document.getElementById("dependencies-extra-message").innerText = message;
    }

    function getExtraMsg() {
        return document.getElementById("dependencies-extra-message").innerText;
    }

    function addExtraMsg(message) {
        setExtraMsg(getExtraMsg() + (getExtraMsg() !== "" ? "\n" : "") + message)
    }

    async function updateOrnitheDependencies() {
        if (possibleVersions.some(version => versionSelectorInput.value === version)) {
            document.getElementById("ornithe-dependencies").innerText = await constructOrnitheDependenciesMessage();
        }
    }

    async function constructOrnitheDependenciesMessage() {
        setExtraMsg("");

        let lines = [
            "### <project root>/gradle.properties",
            "# Dependencies"
        ];

        const loader = Object.entries(loaderSelectorRadios).find(([_, button]) => button.checked)[0];

        const minecraftVersion = versionSelectorInput.value;
        const loaderVersion = await getLatestLoader(loader);
        const oslVersion = await getLatestOsl();

        lines.push(
            `minecraft_version = ${minecraftVersion}`,
            `loader_version = ${loaderVersion}`,
            `osl_version = ${oslVersion}`
        );

        const featherBuild = await getLatestFeatherBuild(minecraftVersion);

        if (featherBuild !== null) {
            addExtraMsg("Make sure to use the \"merged\" mod template for this Minecraft version!");

            lines = lines.concat(await getOrnitheDependenciesForMerged(minecraftVersion, featherBuild));
        } else {
            addExtraMsg("Make sure to use the \"split\" mod template for this Minecraft version!");

            lines = lines.concat(await getOrnitheDependenciesForSplit(minecraftVersion, "client"));
            lines = lines.concat(await getOrnitheDependenciesForSplit(minecraftVersion, "server"));
        }

        return lines.join("\n");
    }

    async function getOrnitheDependenciesForMerged(minecraftVersion, featherBuild) {
        const lines = [];

        const ravenBuild = await getLatestRavenBuild(minecraftVersion);
        const sparrowBuild = await getLatestSparrowBuild(minecraftVersion);
        const nestsBuild = await getLatestNestsBuild(minecraftVersion);

        lines.push(`feather_build = ${featherBuild}`);
        if (ravenBuild !== null) {
            lines.push(`raven_build = ${ravenBuild}`);
        } else {
            addExtraMsg("Raven is unavailable for this Minecraft version - make sure to edit your build.gradle appropriately!");
        }
        if (sparrowBuild !== null) {
            lines.push(`sparrow_build = ${sparrowBuild}`);
        } else {
            addExtraMsg("Sparrow is unavailable for this Minecraft version - make sure to edit your build.gradle appropriately!");
        }
        if (nestsBuild !== null) {
            lines.push(`nests_build = ${nestsBuild}`);
        } else {
            addExtraMsg("Nests are unavailable for this Minecraft version - make sure to edit your build.gradle appropriately!");
        }

        return lines;
    }

    async function getOrnitheDependenciesForSplit(minecraftVersion, environment) {
        const featherBuild = await getLatestFeatherBuild(`${minecraftVersion}-${environment}`);

        if (featherBuild !== null) {
            const lines = [
                "",
                `### <project root>/${environment}/gradle.properties`,
                `environment = ${environment}`
            ];

            let ravenBuild = await getLatestRavenBuild(minecraftVersion);
            if (ravenBuild === null) {
                ravenBuild = await getLatestRavenBuild(`${minecraftVersion}-${environment}`);
            }
            let sparrowBuild = await getLatestSparrowBuild(minecraftVersion);
            if (sparrowBuild === null) {
                sparrowBuild = await getLatestSparrowBuild(`${minecraftVersion}-${environment}`);
            }
            let nestsBuild = await getLatestNestsBuild(minecraftVersion);
            if (nestsBuild === null) {
                nestsBuild = await getLatestNestsBuild(`${minecraftVersion}-${environment}`);
            }

            lines.push(`feather_build = ${featherBuild}`);
            if (ravenBuild !== null) {
                lines.push(`raven_build = ${ravenBuild}`);
            } else {
                addExtraMsg(`Raven is unavailable on the ${environment} for this Minecraft version - make sure to edit your build.gradle appropriately!`);
            }
            if (sparrowBuild !== null) {
                lines.push(`sparrow_build = ${sparrowBuild}`);
            } else {
                addExtraMsg(`Sparrow is unavailable on the ${environment} for this Minecraft version - make sure to edit your build.gradle appropriately!`);
            }
            if (nestsBuild !== null) {
                lines.push(`nests_build = ${nestsBuild}`);
            } else {
                addExtraMsg(`Nests are unavailable on the ${environment} for this Minecraft version - make sure to edit your build.gradle appropriately!`);
            }

            return lines;
        }

        return [];
    }

    Object.entries(loaderSelectorRadios).forEach(([_, button]) => button.addEventListener("change", async _ => await updateOrnitheDependencies()));

    versionSelectorInput.addEventListener("input", async _ => await updateOrnitheDependencies())

    allowSnapshotsCheck.addEventListener("change", _ => {
        if (allowSnapshotsCheck.checked) {
            possibleVersions = minecraftAllVersions;
        } else {
            possibleVersions = minecraftStableVersions;
        }
        updateVersionList();
        updateOrnitheDependencies();
    })

    function updateVersionList() {
        const list = possibleVersions;
        while (versionListElement.firstChild) versionListElement.removeChild(versionListElement.lastChild);
        list.forEach(e => {
            const opt = new Option();
            opt.value = e;
            versionListElement.appendChild(opt);
        });
    }

    possibleVersions = minecraftStableVersions;
    updateVersionList()
    await updateOrnitheDependencies()

})()
