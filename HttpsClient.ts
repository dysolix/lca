import { ClientRequest, IncomingMessage } from "http";
import * as https from "https";

export default class HttpsClient {
    hostname: string;
    port: number;
    defaultHeaders: {};
    agent: (boolean | https.Agent);

    constructor(hostname: string, port = 443, defaultHeaders = {}) {
        this.hostname = hostname;
        this.port = port;
        this.defaultHeaders = defaultHeaders;

        if (this.hostname === "127.0.0.1")
            this.agent = new https.Agent({ rejectUnauthorized: false });
        else
            this.agent = false;
    }

    getOptions(): LCA.HttpsRequestOptions {
        return {
            hostname: this.hostname,
            port: Number(this.port),
            headers: { ...this.defaultHeaders },
            agent: this.agent
        };
    }

    createRequest(method: string, path: string) {
        let request: LCA.HttpsRequest = {
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

declare global {
    namespace LCA {
        type HttpsRequest = {
            options: HttpsRequestOptions,
            setHeader: (headerName: string, headerValue: any) => void,
            send: (callback: (response: IncomingMessage) => void) => ClientRequest
        }

        type HttpsRequestOptions = {
            hostname: string,
            port: number,
            method?: string,
            path?: string,
            headers: { [key: string]: any; },
            agent: https.Agent | boolean
        }
    }
}