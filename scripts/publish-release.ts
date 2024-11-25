const T10_MIN = 600_000 as const;
const T1_MIN = 60_000 as const;

console.log("Publishing release...", process.argv.slice(2));

await sleep(T1_MIN);
// Exit with error to test retry
process.exit(1);

async function sleep(n: number) {
    return new Promise((resolve) => setTimeout(resolve, n));
}
