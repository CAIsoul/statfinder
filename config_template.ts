const config: any = {
    development: {
        debug: true,
        basename: "",
        baseApiUrl: "/api",
        jiraBaseUrl: "",
        teamMembers: {},
    },
    production: {
        debug: false,
        basename: "",
        baseApiUrl: "",
        jiraBaseUrl: "",
        teamMembers: {},
    }
}

// export default config[process.env.NODE_ENV || 'development'];
export default config['development'];