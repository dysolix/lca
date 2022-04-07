import { ClientRequest, IncomingMessage } from "http";
import * as nodeHttps from "https";

namespace https{
    export class Client {
        hostname: string;
        port: number;
        defaultHeaders: {};
        agent: (boolean | nodeHttps.Agent);
    
        constructor(hostname: string, port = 443, defaultHeaders = {}) {
            this.hostname = hostname;
            this.port = port;
            this.defaultHeaders = defaultHeaders;
    
            if (this.hostname === "127.0.0.1")
                this.agent = new nodeHttps.Agent({ rejectUnauthorized: false });
            else
                this.agent = false;
        }
    
        getOptions(): RequestOptions {
            return {
                hostname: this.hostname,
                port: Number(this.port),
                headers: { ...this.defaultHeaders },
                agent: this.agent
            };
        }
    
        createRequest(method: string, path: string) {
            let request: Request = {
                options: this.getOptions(),
                setHeader: (headerName, headerValue) => {
                    request.options.headers[headerName] = headerValue;
                },
                send: (callback) => {
                    return nodeHttps.request(request.options, response => callback(response));
                }
            };
    
            request.options['method'] = method;
            request.options['path'] = path;
    
            return request;
        }
    }

    type Request = {
        options: RequestOptions,
        setHeader: (headerName: string, headerValue: any) => void,
        send: (callback: (response: IncomingMessage) => void) => ClientRequest
    }

    type RequestOptions = {
        hostname: string,
        port: number,
        method?: string,
        path?: string,
        headers: { [key: string]: any; },
        agent: nodeHttps.Agent | boolean
    }
}

export default https;