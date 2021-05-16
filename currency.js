function calculateCurrency(Gp,Sp,Cp) {
  let cp = 0;
  Cp = Cp == "" ? 0 : Cp;
  Sp = Sp == "" ? 0 : Sp;
  Gp = Gp == "" ? 0 : Gp;
  cp += parseInt(Cp);
  cp += parseInt(Sp) * 12;
  cp += parseInt(Gp) * 20 * 12;
  let gp = Math.floor(cp / 240);
  cp -= (gp * 240);
  let sp = Math.floor(cp / 12);
  cp -= (sp * 12);
  return [gp, sp, cp];
}

function currencyToString(currency) {
  let string = '';
  if (currency[0] > 0) {
    string += currency[0];
    string += ' Gp';
  }

  if (currency[1] > 0) {
    if (string.length > 0) {
      string += ', ';
    }
    string += currency[1];
    string += ' Sp';
  }

  if (currency[2] > 0) {
    if (string.length > 0) {
      string += ', ';
    }
    string += currency[2];
    string += ' Cp';
  }
  return string;
}

function parseCurrency(string) {
  string = string.toLowerCase();
  stringArray = string.split(", ");
  moneyArray = [0,0,0];
  stringArray.forEach( coin => {
    let index = -1;
    if (coin.endsWith(" gp")) {
      index = 0;
    } else if (coin.endsWith(" sp")) {
      index = 1;
    } else if (coin.endsWith(" cp")) {
      index = 2;
    }
    if (index != -1) {
        moneyArray[index] = parseInt(coin.substr(0, coin.length - 3));
    }
  })
  return moneyArray;
}

module.exports.calculateCurrency = calculateCurrency;
module.exports.parseCurrency = parseCurrency;
module.exports.currencyToString = currencyToString;
