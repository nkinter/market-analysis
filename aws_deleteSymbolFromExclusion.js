const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

exports.handler = (event, context, callback) => {

// Get Symbol Input From Event
    const symbol = event["queryStringParameters"]['symbol'].toString().toUpperCase();

// For parametrized query
    const values = [symbol];

    if (symbol === undefined) {
        callback(null, {
                "statusCode": 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                "body": JSON.stringify({Error: "Error. No symbol specified"})
            }
        );
    }

    const queryString = "delete from prod.stock_exclusion_list where symbol = $1;";

    const client = new pg.Client({
        host: 'marketanalysisdb.cycqbegtfmzx.us-east-1.rds.amazonaws.com',
        database: 'ma',
        port: 5432,
        user: 'nkinter',
        password: 'vane3123',
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
                'body': JSON.stringify({ Success: "Deleted symbol " + symbol + " from exclusion list."})
            });
        }
    });
};