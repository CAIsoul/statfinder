const config: any = {
    development: {
        debug: true,
        baseApiUrl: "/api",
    },
    production: {
        debug: false,
        baseApiUrl: "",
    }
}

// export default config[process.env.NODE_ENV || 'development'];
export default config['development'];