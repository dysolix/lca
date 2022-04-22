import * as https from 'https';

/**
* Simple https get request
* @param url 
* @returns The response string or null
*/
export function httpsGet(url: string): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
        https.get(url, res => {
            var resBody: string[] = [];

            res.setEncoding('utf8');
            res.on('data', data => resBody.push(data));
            res.on('end', () => resolve(resBody.join("")));
            res.on('error', (err) => reject());
        });
    }).then(value => value, err => null);
}

/**
 * Compares two patch versions
 * @returns true, if the first patch is newer 
 */
export function isPatchNewer(firstPatch: string, secondPatch: string): boolean {
    let firstPatchArr = firstPatch.split(".").map(n => Number(n));
    let secondPatchArr = secondPatch.split(".").map(n => Number(n));

    for (let i = 0; i < firstPatchArr.length; i++) {
        if (firstPatchArr[i] > secondPatchArr[i])
            return true;
        if (firstPatchArr[i] < secondPatchArr[i])
            return false;
    }

    return true;
}

/**
 * @param delay Delay in milliseconds
 * @returns A Promise that fulfills after given delay
 */
export function delay(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}