import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios'
import { MyError } from '../util/util'

export class Redmine {
    private baseURL: string
    private options: RedmineTS.Config
    private conn: any

    /**
     * Constructor
     * 
     * @param baseUrl 
     * @param options 
     */
    constructor(baseUrl: string, options: RedmineTS.Config) {
        if (!baseUrl) {
            throw Error('Redmine host is not specified.')
        }

        this.baseURL = baseUrl
        this.options = options
    }

    /**
     * Deeply iterate through given object and replace all found arrays into comma separated strings.
     * 
     * @param obj 
     */
    private static _deepJoinArrays(obj: any) {
        const newObj: any = {};
        for (const k in obj) {
            const v = obj[k];
            newObj[k] = (typeof v === "object") ? (Array.isArray(v)) ? v.join(",") : Redmine._deepJoinArrays(v) : v;
        }
        return newObj;
    }

    /**
     * request
     * 
     * @param method 
     * @param path 
     * @param params 
     * @returns 
     */
    private request(method: Method, path: string, params: any = {}): Promise<any> {
        if (!this.conn) {
            const { apiKey } = this.options ?? ''
            const connCofig: AxiosRequestConfig = {
                baseURL: this.baseURL,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Redmine-API-Key': apiKey
                }
            }

            this.conn = axios.create(connCofig)
        }

        return this.conn[method.toLocaleLowerCase()](
            `/${path}.json`,
            (method === 'GET' || method === 'get') ? Redmine._deepJoinArrays(params) : params,
            {}
        )
            .then((res: AxiosResponse) => res.data)
            .catch((err: any) => {
                MyError.showError(err)
            })
    }

    /**
     * Returns users
     * 
     * @param params
     * @returns 
     */
    public listUsers(params?: RedmineTS.Users.ListParams): Promise<any> {
        return this.request('get', 'users', { params })
    }

    /**
     * Return time entries
     * 
     * @param params 
     * @returns 
     */
    public listTimeEntries(params?: RedmineTS.TimeEntries.ListParams): Promise<any> {
        return this.request('get', 'time_entries', { params })
    }

    public listIssues(params?: RedmineTS.Issues.ListParams): Promise<RedmineTS.Issues.Issues> {
        return this.request('get', 'issues', { params })
    }
}

export namespace RedmineTS {

    export type Config = {
        apiKey: string
    }

    export namespace Common {

        export type PaginationParams = {
            limit?: number
            offset?: number
        }

        export type Data = {
            id: number
            name?: string
            value?: number
        }
    }

    export namespace Users {

        export type ListParams = Common.PaginationParams & {
            name?: string
            group_id?: number
        }
    }

    export namespace TimeEntries {

        export type ListParams = Common.PaginationParams & {
            user_id?: number
            project_id?: number
            spent_on?: string
            from?: string
            to?: string
        }

        export type TimeEntries = {
            time_entries: TimeEntry[]
            total_count: number
            offset: number
            limit: number
        }

        export type TimeEntry = {
            id: number
            project: Common.Data
            issue: Common.Data
            user: Common.Data
            activity: Common.Data
            hours: number
            comments: string
            spent_on: string
            custom_fields: Common.Data[]
        }
    }

    export namespace Issues {
        export type ListParams = Common.PaginationParams & {
            status_id?: number | 'open' | 'closed' | '*'
        }

        export type Issue = {
            id: number
            project: Common.Data
            status?: Common.Data
            priority?: Common.Data
            assigned_to?: Common.Data
            subject: string
            description: string
            done_ratio: number
        }

        export type Issues = {
            issues: any[]
            total_count: number
            offset: number
            limit: number
        }
    }
}