#! /usr/bin/env node

const each = require('foreach');
const request = require('request');
const chalk = require('chalk');
const Table = require('cli-table');
const jsonfile = require('jsonfile');
const figlet = require('figlet');
const file = 'portfolio.json';
const portfolio = jsonfile.readFileSync(file);

figlet('Crypto Portfolio', function(err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }
  console.log(data)
});

request('https://api.coinmarketcap.com/v1/ticker/?limit=100', function (error, response, body) {
  var data = JSON.parse(body);
  var table = new Table({ head: [
    chalk.blue('Rank'),
    chalk.blue('Coin'),
    chalk.blue('USD Price'),
    chalk.blue('Coins Owned'),
    chalk.blue('Net Worth'),
    chalk.blue('24 Hour Volume'),
    chalk.blue('Market Cap'),
    chalk.blue('1 Hour'),
    chalk.blue('24 Hours'),
    chalk.blue('7 Days'),
    chalk.blue('Last Updated'),
  ] });
  var currSym = '$';
  each(data, function (value, key, array) {
    if(portfolio.hasOwnProperty(value.id)) {
      table.push([
        chalk.blue(value.rank),
        chalk.green(value.id),
        chalk.green(currSym + addCommas(value.price_usd)),
        chalk.green(addCommas(portfolio[value.id])),
        chalk.green(currSym + addCommas(Number(Math.round(value.price_usd * portfolio[value.id])))),
        chalk.green(currSym + addCommas(addZeroes(value['24h_volume_usd']))),
        chalk.green(currSym + addCommas(addZeroes(value.market_cap_usd))),
        chalk.green(`${value.percent_change_1h} %`),
        chalk.green(`${value.percent_change_24h} %`),
        chalk.green(`${value.percent_change_7d} %`),
        chalk.green(timeSince(new Date(value.last_updated * 1000)) + ' ago'),
      ]);
    }
  });
  console.log(table.toString());
});

/**
* Add zero if number only has one zero
* Example: $666,888.0 >> $666,888.00
* Fixes coinmarketcap API issues for market caps
* https://stackoverflow.com/a/24039448
*/

function addZeroes( num ) {
  var value = Number(num);
  var res = num.split(".");
  if(num.indexOf('.') === -1) {
    value = value.toFixed(2);
    num = value.toString();
  } else if (res[1].length < 3) {
    value = value.toFixed(2);
    num = value.toString();
  }
  return num
}

/**
* Comma seperate big numbers
* Took multiple answers
* from https://stackoverflow.com/questions/1990512/add-comma-to-numbers-every-three-digits/
* This work with small coins like dogecoin and does not comma seperate AFTER decimals
*/

function addCommas(nStr){
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
};


/**
* Pretty time format X ago function
* https://stackoverflow.com/a/3177838
*/

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

