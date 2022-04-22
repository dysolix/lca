import * as fs from "fs/promises";

let distPackage = JSON.parse(await fs.readFile("./dist/package.json"));
let packageObj = JSON.parse(await fs.readFile("./package.json"));

if (distPackage.name === packageObj.name) {
    packageObj.version = distPackage.version;
}

await fs.writeFile("./package.json", JSON.stringify(packageObj, null, 4));