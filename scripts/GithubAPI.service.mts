import { KyInstance } from "ky";

interface Spec {
    http: KyInstance;
    token: string;
}

export class GithubAPI {
    http: KyInstance;

    constructor(spec: Spec) {
        this.http = spec.http.extend({
            prefixUrl: "https://api.github.com",
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${spec.token}`,
                "X-GitHub-Api-Version": "2022-11-28"
            }
        });
    }

    async getByTag({
        owner,
        repo,
        tag
    }: {
        owner: string;
        repo: string;
        tag: string;
    }): Promise<GHRelease> {
        return this.http
            .get(`repos/${owner}/${repo}/releases/tags/${tag}`)
            .json<GHRelease>();
    }

    async updateRelease({
        owner,
        repo,
        releaseId,
        json
    }: {
        owner: string;
        repo: string;
        releaseId: string;
        json: unknown;
    }): Promise<GHRelease> {
        return this.http
            .patch(`repos/${owner}/${repo}/releases/${releaseId}`, { json })
            .json<GHRelease>();
    }
}

interface GHRelease {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    published_at: string;
    html_url: string;
    assets: unknown[];
}
