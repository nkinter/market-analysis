const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

exports.handler = (event, context, callback) => {

    const queryString = "select symbol from prod.stock_exclusion_list;";

    const client = new pg.Client({
        host: 'marketanalysisdb.cycqbegtfmzx.us-east-1.rds.amazonaws.com',
        database: 'ma',
        port: 5432,
        user: 'nkinter',
        password: 'vane3123',
    });

    client.connect();

    client.query(queryString, (err, res) => {
        if (err) {
            client.end();
            console.log(err.stack);
            callback(null, {
                    "statusCode": 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    "body": JSON.stringify({Error: "Error returned during query execution."})
                }
            );
        } else {
            client.end();
            callback(null, {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': JSON.stringify(res.rows)
            });
        }
    });

};