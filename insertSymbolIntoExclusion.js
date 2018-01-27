const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

// Get Symbol Input From Event
const symbol = "DCIX";

// For parametrized query
const values = [symbol];

if (symbol===undefined) {
    console.log({"statusCode": 400,
        'headers': { 'Content-Type': 'application/json' },
        "body": "Incorrect Market Cap Specified."}
    );
}

const queryString = "INSERT INTO prod.stock_exclusion_list (symbol) values ($1);";

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
        console.log({"statusCode": 400,
            'headers': { 'Content-Type': 'application/json' },
            "body": "Error Returned During Query"}
        )
    } else {
        client.end();
        console.log({
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json' },
            'body': "Success Entering Symbol"
        });
    }
});