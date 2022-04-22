import * as fs from "fs/promises";

await fs.rm("./dist", { recursive: true, force: true});
await fs.mkdir("./dist");