const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

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
        console.log({"statusCode": 400,
            'headers': { 'Content-Type': 'application/json' },
            "body": JSON.stringify({Error: "Error returned during query execution."})
        });
    } else {
        client.end();
        console.log({
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json' },
            'body': JSON.stringify(res.rows)
        });
    }
});