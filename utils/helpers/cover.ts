import {
  parseBytes32String,
  formatBytes32String,
} from "@ethersproject/strings";
import { sumOf, toBN } from "@utils/functions/bn";
import BigNumber from "bignumber.js";

export const getParsedKey = (bytes32String: string) => {
  try {
    return parseBytes32String(bytes32String);
  } catch (error) {
    return bytes32String;
  }
};

export const toBytes32 = (str: string) => {
  try {
    return formatBytes32String(str);
  } catch (error) {
    return str;
  }
};

export const getCoverImgSrc = (coverInfo: any) => {
  try {
    return `/images/covers/${parseBytes32String(coverInfo?.key)}.svg`;
  } catch (error) {
    return `/images/covers/empty.svg`;
  }
};

export const defaultStats = {
  liquidity: "0",
  protection: "0",
  utilization: "0",
};

export const calculateCoverStats = (cover: any) => {
  try {
    const liquidity = sumOf(
      ...cover.vaults.map((x: any) => {
        return toBN(x.totalCoverLiquidityAdded)
          .minus(x.totalCoverLiquidityRemoved)
          .plus(x.totalFlashLoanFees);
      })
    ).toString();

    const protection = sumOf(
      ...cover.cxTokens.map((x: any) => x.totalCoveredAmount)
    ).toString();

    const utilization = toBN(protection)
      .dividedBy(liquidity)
      .decimalPlaces(2)
      .toString();

    return {
      liquidity,
      protection,
      utilization: utilization == "NaN" ? "0" : utilization,
    };
  } catch (err) {
    console.error(err);
  }

  return defaultStats;
};

export const toEther = (x: string) =>
  new BigNumber((parseFloat(x) * 10 ** 18).toString()).toString();

export const percentage = (x: string) =>
  new BigNumber((parseFloat(x) * 10000).toString()).dividedBy(100).toString();
