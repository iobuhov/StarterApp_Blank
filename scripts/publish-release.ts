import { $ } from "zx";

const T10_MIN = 600_000 as const;
const T1_MIN = 60_000 as const;

const [tag] = process.argv.slice(2);
const tagMessage = await $`git tag -l --format='%(contents)' ${tag}`.text();
let [studioProVersion] =
    await $`git describe --tags --match='sp/*' --abbrev=0 ${tag}`.lines();
studioProVersion = studioProVersion.replace("sp/", "");
const isStudioProMatched = tagMessage
    .trim()
    .endsWith(`(Studio Pro ${studioProVersion})`);

console.log("mxversion:", studioProVersion);
console.log("isStudioProMatched:", isStudioProMatched);

// Exit with error to test retry
process.exit(1);

async function sleep(n: number) {
    return new Promise((resolve) => setTimeout(resolve, n));
}
