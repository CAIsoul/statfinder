const config: any = {
    development: {
        debug: true,
        baseApiUrl: "/api",
        jiraBaseUrl: "",
        teamMembers: {},
    },
    production: {
        debug: false,
        baseApiUrl: "",
        jiraBaseUrl: "",
        teamMembers: {},
    }
}

// export default config[process.env.NODE_ENV || 'development'];
export default config['development'];