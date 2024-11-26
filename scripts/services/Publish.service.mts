import { KyInstance } from "ky";
import { SemVer } from "semver";

interface Spec {
    http: KyInstance;
    config: {
        host: string;
        username: string;
        password: string;
        openid: string;
    };
}

interface Draft {
    UUID: string;
}

export class PublishService {
    private readonly contributorAPI: KyInstance;

    constructor(spec: Spec) {
        this.contributorAPI = this.createContributorAPI(spec);
    }

    private createContributorAPI({ http, config }: Spec): KyInstance {
        const { host, username, password, openid } = config;
        const credentials = Buffer.from(`${username}:${password}`).toString(
            "base64"
        );

        return http.extend({
            prefixUrl: new URL("/apis/v1", host),
            headers: {
                Authorization: `Basic ${credentials}`,
                OpenID: openid,
                Accept: "application/json"
            }
        });
    }

    /**
     * Create a draft release for a package.
     * @param id - package number.
     * @param input - draft input.
     * @returns Draft model.
     */
    async createDraft(
        id: number,
        input: {
            version: SemVer;
            studioProVersion: string;
            githubArtifactURL: string;
        }
    ): Promise<Draft> {
        const body = {
            VersionMajor: input.version.major,
            VersionMinor: input.version.minor,
            VersionPatch: input.version.patch,
            StudioProVersion: input.studioProVersion,
            IsSourceGitHub: true,
            GithubRepo: {
                UseReadmeForDoc: false,
                ArtifactURL: input.githubArtifactURL
            }
        };
        return this.contributorAPI
            .post(`packages/${id}/versions`, { json: body })
            .json<Draft>();
    }

    async publishDraft(uuid: string): Promise<void> {
        await this.contributorAPI.patch(`package-versions/${uuid}`, {
            json: { Status: "Publish" }
        });
    }

    async publish(
        id: number,
        input: {
            version: SemVer;
            studioProVersion: string;
            githubArtifactURL: string;
        }
    ) {
        const { UUID } = await this.createDraft(id, input);
        await this.publishDraft(UUID);
    }
}
