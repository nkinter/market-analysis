const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

exports.handler = (event, context, callback) => {

// Get Symbol Input From Event
    const body = JSON.parse(event.body);

// For parametrized query
    const values = [body.symbol];

    if (body.symbol === undefined) {
        callback(null, {
                "statusCode": 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                "body": JSON.stringify({Error: "Error. No symbol specified."})
            }
        );
    }

    const queryString = "delete from prod.stock_exclusion_list where symbol = $1;";

    const client = new pg.Client({
        host: 'marketanalysisdb.cycqbegtfmzx.us-east-1.rds.amazonaws.com',
        database: 'ma',
        port: 5432,
        user: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
    });

    client.connect();

    client.query(queryString, values, (err, res) => {
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
                'body': JSON.stringify({ Success: "Deleted symbol " + body.symbol + " from exclusion list."})
            });
        }
    });
};