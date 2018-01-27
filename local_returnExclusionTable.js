const lambdaLocal = require('lambda-local');

const jsonPayload_1 = {
    "queryStringParameters": {
    },
    "body": {}
};

lambdaLocal.execute({
    event: jsonPayload_1,
    lambdaPath: __dirname + '/Lambda/returnExclusionTable.js',
    timeoutMs: 3000
}).then(function(done) {
    console.log(done);
}).catch(function(err) {
    console.log(err);
});