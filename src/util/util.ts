export class MyError {
    public static showError(err: any) {
        if (err.errno) {
            throw Error(`Axios connection problem (${err.config.baseURL}): ${err.errno}`)
        }

        if (err.response) {
            let message = `${err.response.status} ${err.response.statusText} (${err.request.path})`

            if (Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
                message += `\n${err.response?.data.errors.join(", ")}`
            }
            throw Error(message)
        }
        else {
            throw err;
        }
    }
}