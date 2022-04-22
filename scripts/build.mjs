import * as fs from "fs/promises";
import prompt from "prompt"
import Data from "../dist/Data.js";

String.prototype.replaceAll = (searchValue, replaceValue) => {
    let returnValue = "";

    while(returnValue.includes(searchValue)){
        returnValue = returnValue.replace(searchValue, replaceValue);
    }

    return returnValue;
}

var packageObj = JSON.parse(await fs.readFile("./package.json", "utf8"));
delete packageObj.scripts;
delete packageObj.private;
delete packageObj.devDependencies;

packageObj.main = "./index.js";
packageObj.types = "./global.d.ts";

prompt.start();

let result = await new Promise((resolve, reject) => {
    prompt.get([
        {
            name: 'version',
            validator: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
            empty: true,
            default: packageObj.version
        },
        {
            name: 'name',
            default: packageObj.name,
            empty: true
        }
    ], function (err, result) {
        if (err) {
            reject();
            return;
        }

        resolve({ version: result.version, name: result.name });
    });
}).then(val => val, err => null);

packageObj.version = result.version;
packageObj.name = result.name;

await fs.writeFile("./dist/package.json", JSON.stringify(packageObj, null, 4));

var types = await fs.readFile("./src/types.d.ts", "utf8") + "\r\n" + await fs.readFile("./generated.d.ts", "utf8");
types = types.replace("declare module \"index\"", `declare module \"${result.name}\"`);

while(types.includes("import(\"./")){
    types = types.replace("import(\"./", "import(\"");
}

let dataKeys = "";

Object.entries(Data).forEach(([key, val]) => {
    if(typeof val?.load === "function"){
        let keyString = '"' + key + '"';
        if(dataKeys === ""){
            dataKeys = keyString;
        }else{
            dataKeys += " | " + keyString;
        }
    }
})

types = types.replace("type DataKey = {}", `type DataKey = ${dataKeys}`)

await fs.writeFile("./dist/global.d.ts", types);
await fs.rm("./generated.d.ts");