const config: any = {
    development: {
        debug: true,
        jiraBaseUrl: "",
        jiraUsername: "",
        jiraToken: "",
    },
    production: {
        debug: false,
        jiraBaseUrl: "",
        jiraUsername: "",
        jiraToken: "",
    }
}

// export default config[process.env.NODE_ENV || 'development'];
export default config['development'];