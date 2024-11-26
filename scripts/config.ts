export const config = (env: string) => {
    if (env === "production") {
        return {
            host: process.env.CPAPI_HOST_PROD!,
            password: process.env.CPAPI_PASS_PROD!,
            username: process.env.CPAPI_USER_PROD!,
            openid: "https://mxid2.mendixcloud.com/mxid2/id?id=a39025a8-55b8-4532-bc5d-4e74901d11f9",
            appNumber: 51830
        };
    } else {
        return {
            host: process.env.CPAPI_HOST!,
            password: process.env.CPAPI_PASS!,
            username: process.env.CPAPI_USER!,
            openid: "https://mxid2-accp.mendixcloud.com/mxid2/id?id=76684b9b-65c1-48f0-9c0f-851953dfcc32",
            appNumber: 430
        };
    }
};
