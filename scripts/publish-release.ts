import ky from "ky";
import { SemVer } from "semver";
import { $ } from "zx";
import { config } from "./config.js";
import { GithubAPI } from "./services/GithubAPI.service.mjs";
import { PublishService } from "./services/Publish.service.mjs";

const T10_MIN = 600_000 as const;
const T1_MIN = 60_000 as const;
const [tag, env, releaseType] = process.argv.slice(2);
const [owner, repo] = process.env.GITHUB_REPOSITORY!.split("/");
const cfg = config(env);

const ghAPI = new GithubAPI({
    http: ky.create(),
    token: process.env.GH_TOKEN!
});

const publishAPI = new PublishService({
    http: ky.create(),
    config: cfg
});

const isLatest = releaseType === "latest";
const refSpec = `refs/tags/${tag}:refs/tags/${tag}`;
await $`git fetch origin ${refSpec}`;
const tagMessage = await $`git tag -l --format='%(contents)' ${tag}`.text();
const [spTag] =
    await $`git describe --tags --match='sp/*' --abbrev=0 ${tag}`.lines();
const studioProVersion = spTag.replace("sp/", "");

const isStudioProMatched = tagMessage
    .trim()
    .endsWith(`(Studio Pro ${studioProVersion})`);

if (!isStudioProMatched) {
    throw new Error("Unable to resolve Studio Pro version");
}

const release = await ghAPI.getByTag({ owner, repo, tag });
const asset = release.assets.find((asset) => asset.name.endsWith(".mpk"));

if (!asset) {
    throw new Error("Unable to find app mpk");
}

try {
    await publishAPI.publish(cfg.appNumber, {
        version: new SemVer(tag),
        studioProVersion,
        githubArtifactURL: asset.browser_download_url
    });
} catch (error) {
    console.error(error);
    console.debug(process.env.CPAPI_HOST, process.env.CPAPI_HOST_PROD);
    await coolDown(T1_MIN);
    process.exit(1);
}

async function coolDown(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}
