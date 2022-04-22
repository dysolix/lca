import * as https from "https";
export default class HttpsClient {
    constructor(hostname, port = 443, defaultHeaders = {}) {
        this.hostname = hostname;
        this.port = port;
        this.defaultHeaders = defaultHeaders;
        if (this.hostname === "127.0.0.1")
            this.agent = new https.Agent({ rejectUnauthorized: false });
        else
            this.agent = false;
    }
    getOptions() {
        return {
            hostname: this.hostname,
            port: Number(this.port),
            headers: Object.assign({}, this.defaultHeaders),
            agent: this.agent
        };
    }
    createRequest(method, path) {
        let request = {
            options: this.getOptions(),
            setHeader: (headerName, headerValue) => {
                request.options.headers[headerName] = headerValue;
            },
            send: (callback) => {
                return https.request(request.options, response => callback(response));
            }
        };
        request.options.method = method;
        request.options.path = path;
        return request;
    }
}
