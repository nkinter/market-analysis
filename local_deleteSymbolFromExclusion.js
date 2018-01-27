const lambdaLocal = require('lambda-local');

const jsonPayload_1 = {
    "queryStringParameters": {
    },
    "body": "{\"symbol\":\"EBAY\"}"
};

lambdaLocal.execute({
    event: jsonPayload_1,
    lambdaPath: __dirname + '/Lambda/deleteSymbolFromExclusion.js',
    timeoutMs: 3000
}).then(function(done) {
    console.log(done);
}).catch(function(err) {
    console.log(err);
});