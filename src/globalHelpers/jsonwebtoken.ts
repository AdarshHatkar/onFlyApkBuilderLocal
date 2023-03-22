import jwt from 'jsonwebtoken';


export let jwtVerifyAsync = (jwtToken, secret) => {
    return new Promise((resolve, reject) => {
        async function main() {
            jwt.verify(jwtToken, secret, function (err, payload) {

                if (err) {
                    reject(err)
                }
                resolve(payload)
            });
        }
        main()
    })
}