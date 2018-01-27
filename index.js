var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

exports.handler = (event, context, callback) => {

    const metricFound = false;
    if (event["queryStringParameters"]['metric']!==null) {
        metricFound = true;
    }

    const client = new pg.Client({
        host: 'marketanalysisdb.cycqbegtfmzx.us-east-1.rds.amazonaws.com',
        database: 'ma',
        port: 5432,
        user: 'nkinter',
        password: 'vane3123',
    });

    client.connect();

    const values = [event["queryStringParameters"]['symbol'].toUpperCase()];

    client.query("SELECT * FROM prod.stock_metrics where symbol = $1", values, (err, res) => {
        if (err) {
            client.end();
            console.log(err.stack);
            callback(null, {"statusCode": 400,
                'headers': { 'Content-Type': 'application/json' },
                "body": "Error Returned During Query"}
                )
        } else {
            client.end();
            callback(null, {
                'statusCode': 200,
                'headers': { 'Content-Type': 'application/json' },
                'body': JSON.stringify(res.rows)
            });
        }
    })
};
