const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const pg = require('pg');


const dollars = 15000;
const size = 20;
const marketcap = "medium";
const sector = "Consumer Services";
//const sector = undefined;

const values = [dollars,size];
let capMinSmall = 0;
let capMaxSmall = 0;
let capMinMedium = 0;
let capMaxMedium = 0;
let capMinLarge = 0;
let capMaxLarge = 0;
let capMinTotal = 0;
let capMaxTotal = 0;
let additionalFilter = "";

if (marketcap!==undefined) {
    if (marketcap.toUpperCase().indexOf("SMALL") > -1) {
        capMinSmall = 0;
        capMaxSmall = 2000000000;
    } else if (marketcap.toUpperCase().indexOf("MEDIUM") > -1) {
        capMinMedium = 2000000000;
        capMaxMedium = 10000000000;
    } else if (marketcap.toUpperCase().indexOf("LARGE") > -1) {
        capMinLarge = 10000000000;
        capMaxLarge = 999999999999999;
    } else {
        console.log({"statusCode": 400,
            'headers': { 'Content-Type': 'application/json' },
            "body": JSON.stringify({ Error: "Error. Incorrect Market Cap Specified"})
        );
    }
} else {
    capMinTotal = 0;
    capMaxTotal = 999999999999999;
}

values.push(capMinSmall);
values.push(capMaxSmall);
values.push(capMinMedium);
values.push(capMaxMedium);
values.push(capMinLarge);
values.push(capMaxLarge);
values.push(capMinTotal);
values.push(capMaxTotal);

let sectorFound = false;
if (sector!==undefined) {
    sectorFound = true;
    const splitString = sector.toString().toUpperCase().split(",");
    const finalArray = [splitString];
    values.push(finalArray);
}

if (sectorFound) {
    additionalFilter = "and upper(coalesce(s.sector,'miscellaneous')) = ANY($11)";
}

const queryString = "SELECT\n" +
    "  a.*\n" +
    ",value_calc / sum(value_calc) over () as value_weight\n" +
    ",round($1 * (value_calc / sum(value_calc) over ()) / sale_price) as shares_to_buy\n" +
    ",cast(round($1 * (value_calc / sum(value_calc) over ()) / sale_price) * sale_price as decimal(18,2)) as total_cost\n" +
    "from (\n" +
    "  SELECT\n" +
    "    rank() OVER (ORDER BY value_calc DESC) AS rank,\n" +
    "    symbol,\n" +
    "    sale_price,\n" +
    "    roic,\n" +
    "    earnings_yield,\n" +
    "    value_calc\n" +
    "  FROM (\n" +
    "    select\n" +
    "    s.symbol\n" +
    "    ,s.open as sale_price\n" +
    "    ,s.metric_val as roic\n" +
    "    ,coalesce(1/(s.pe_ratio/100),0) as earnings_yield\n" +
    "    ,stddev(s.metric_val) over (partition by 1) as std_dev_roic\n" +
    "    ,stddev(coalesce(1/(s.pe_ratio/100),0)) over (partition by 1) as std_dev_earnings_yield\n" +
    "    ,avg(s.metric_val) over (partition by 1) as avg_roic\n" +
    "    ,avg(coalesce(1/(s.pe_ratio/100),0)) over (partition by 1) as avg_earnings_yield\n" +
    "    ,(s.metric_val-avg(s.metric_val) over (partition by 1)) / stddev(s.metric_val) over (partition by 1) as roic_stndrd\n" +
    "    ,(coalesce(1/(s.pe_ratio/100),0)-avg(coalesce(1/(s.pe_ratio/100),0)) over (partition by 1)) / stddev(coalesce(1/(s.pe_ratio/100),0)) over (partition by 1) as earnings_yield_stndrd\n" +
    "    ,((s.metric_val-avg(s.metric_val) over (partition by 1)) / stddev(s.metric_val) over (partition by 1) +\n" +
    "    (coalesce(1/(s.pe_ratio/100),0)-avg(coalesce(1/(s.pe_ratio/100),0)) over (partition by 1)) / stddev(coalesce(1/(s.pe_ratio/100),0)) over (partition by 1)) * 10 + 50 as value_calc\n" +
    "    from prod.value_fund_base s\n" +
    "    where s.open >= 3\n" +
    "    and coalesce(1/(s.pe_ratio/100),0) > 0\n" +
    "    and s.symbol not in (select symbol from prod.stock_exclusion_list)\n" +
    "    and (s.market_cap between $3 and $4 OR \n" +
    "    s.market_cap between $5 and $6 OR \n" +
    "    s.market_cap between $7 and $8 OR \n" +
    "    s.market_cap between $9 and $10) \n" +
    additionalFilter + "\n" +
    "       ) b\n" +
    ") a\n" +
    "where rank <= $2";

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
        console.log({
            "statusCode": 400,
            'headers': {'Content-Type': 'application/json'},
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