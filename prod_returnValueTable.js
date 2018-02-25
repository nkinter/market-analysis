const lambdaLocal = require('lambda-local');

const jsonPayload_1 = {
    "queryStringParameters": {
        "dollars": "15000",
        "size": "10",
        "marketcap": undefined,
        "sector": undefined
    },
    "body": {}
};

lambdaLocal.execute({
    event: jsonPayload_1,
    lambdaPath: __dirname + '/Prod/returnValueTable.js',
    timeoutMs: 3000
}).then(function(done) {
    console.log(done);
}).catch(function(err) {
    console.log(err);
});