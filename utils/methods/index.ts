const formatPercent = (x: number) => {
  if (isNaN(x)) {
    return "";
  }

  const percent = x * 100;

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: percent < 1 ? 6 : 2,
  }).format(x);
};

const asCurrency = (
  sign: string,
  number: number,
  symbol: string,
  currency: string,
  token = false
) => {
  if (token) {
    if (number < 0.00000001) {
      return "A fraction of " + currency;
    }

    if (parseFloat(number.toString()) < 0.01) {
      number = parseFloat(number.toFixed(8));
    }

    return `${sign}${number.toLocaleString("en-US")}${symbol} ${currency}`;
  }

  let maximumFractionDigits = parseFloat(number.toString()) < 1 ? 8 : 2;

  if (parseFloat(number.toString()) > 1000) {
    maximumFractionDigits = 0;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });

  return `${sign}${formatter.format(number)}${symbol}`;
};

const formatCurrency = (input: number, currency = "USD", token = false) => {
  const number = parseFloat(Math.abs(input).toString());

  if (!number) {
    return { short: "N/A", long: "Not available" };
  }

  const sign = input < 0 ? "-" : "";

  let result = number;
  let symbol = "";

  if (number > 1e4 && number < 1e5) {
    result = parseFloat(number.toFixed(2));
  }

  if (number >= 1e5 && number < 1e6) {
    symbol = "K";
    result = +(number / 1e3).toFixed(2);
  }

  if (number >= 1e6 && number < 1e9) {
    symbol = "M";
    result = +(number / 1e6).toFixed(2);
  }

  if (number >= 1e9 && number < 1e12) {
    symbol = "B";
    result = +(number / 1e9).toFixed(2);
  }

  if (number >= 1e12) {
    symbol = "T";
    result = +(number / 1e12).toFixed(2);
  }

  return {
    short: asCurrency(sign, result, symbol, currency, token),
    long: asCurrency(sign, number, "", currency, token),
  };
};

const getCoverFee = (data: any) => {
  // CONSTANTS
  const MULTIPLIER = 10_000;
  const INCIDENT_SUPPORT_POOL_CAP_RATIO = 2500;

  data.supportPool =
    ((data.reassuranceAmount + data.provision) *
      INCIDENT_SUPPORT_POOL_CAP_RATIO) /
    MULTIPLIER;
  data.totalAvailableLiquidity = data.inVault + data.supportPool;

  if (data.amount > data.totalAvailableLiquidity) {
    throw new Error("Balance insufficient");
  }

  data.utilizationRatio =
    (data.totalCommitment + data.amount) / data.totalAvailableLiquidity;
  let rate =
    data.utilizationRatio > data.floor ? data.utilizationRatio : data.floor;

  rate = rate + (data.duration * 100) / MULTIPLIER;

  if (rate > data.ceiling) {
    rate = data.ceiling;
  }

  data.rate = rate;

  data.projectedFee = (data.rate * data.amount * data.duration) / 12;

  return data;
};

export { formatPercent, formatCurrency, getCoverFee };
