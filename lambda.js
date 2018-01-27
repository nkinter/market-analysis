var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');

const client = new pg.Client({
    host: 'marketanalysisdb.cycqbegtfmzx.us-east-1.rds.amazonaws.com',
    database: 'ma',
    port: 5432,
    user: 'nkinter',
    password: 'vane3123',
});

client.connect();

exports.handler = (event, context, callback) => {
    client.query("SELECT * FROM prod.stock_metrics where symbol = '" + event.symbol + "'", (err, res) => {
        if (err) {
            client.end();
            console.log(err.stack);
            callback(null, JSON.stringify({"statusCode": 400, 'headers': { 'Content-Type': 'application/json' }, "body": "Not good"}))
        } else {
            client.end();
            callback(null, JSON.stringify({"statusCode": 200, 'headers': { 'Content-Type': 'application/json' }, "body": res.rows[0]}))
        }
    })
};
