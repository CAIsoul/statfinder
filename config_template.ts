const config: any = {
    development: {
        debug: true,
        baseApiUrl: "",
    },
    production: {
        debug: false,
        baseApiUrl: "",
    }
}

// export default config[process.env.NODE_ENV || 'development'];
export default config['development'];