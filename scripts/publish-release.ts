import ky from "ky";
import { $ } from "zx";
import { GithubAPI } from "./GithubAPI.service.mjs";

const T10_MIN = 600_000 as const;
const T1_MIN = 60_000 as const;
// npm run publish-release 9.0.0 acceptance patch
const [tag, env, releaseType] = process.argv.slice(2);

const ghAPI = new GithubAPI({
    http: ky.create(),
    token: process.env.GH_TOKEN!
});

const refSpec = `refs/tags/${tag}:refs/tags/${tag}`;
await $`git fetch origin ${refSpec}`;
const tagMessage = await $`git tag -l --format='%(contents)' ${tag}`.text();
const [spTag] =
    await $`git describe --tags --match='sp/*' --abbrev=0 ${tag}`.lines();
const studioProVersion = spTag.replace("sp/", "");

const isStudioProMatched = tagMessage
    .trim()
    .endsWith(`(Studio Pro ${studioProVersion})`);

console.log("tag:", tag);
console.log("env:", env);
console.log("releaseType:", releaseType);
console.log("mxversion:", studioProVersion);
console.log("isStudioProMatched:", isStudioProMatched);
console.log(
    "release:",
    await ghAPI.getByTag({ owner: "mendix", repo: "StarterApp_Blank", tag })
);

// Exit with error to test retry
process.exit(0);

async function sleep(n: number) {
    return new Promise((resolve) => setTimeout(resolve, n));
}
