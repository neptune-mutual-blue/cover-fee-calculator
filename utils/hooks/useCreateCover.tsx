import { useState, useEffect } from "react";
import { cover, registry } from "@neptunemutual/sdk";
import { useWeb3React } from "@web3-react/core";

import {
  convertToUnits,
  isGreater,
  isGreaterOrEqual,
  isLessOrEqual,
  isLessThan,
  isValidNumber,
} from "@utils/functions/bn";
import { getProviderOrSigner } from "@wallet/utils/web3";
import { useTxToast } from "./useTxToast";
import { useErrorNotifier } from "./useErrorNotifier";
import { useNetwork } from "@wallet/context/Network";
import { useAppConstants } from "@utils/app-constants/context";
import { getCoverMinStake } from "@utils/helpers/getCoverMinStake";
import { getCoverCreationFee } from "@utils/helpers/getCoverCreationFee";
import { useERC20Balance } from "./useERC20Balance";

import { convertFromUnits } from "@utils/functions/bn";
import { ICoverInfo } from "@neptunemutual/sdk/dist/types";
import { useERC20Allowance } from "./useERC20Allowance";

export const useCreateCover = ({
  reValue,
  npmValue,
}: {
  coverKey: string;
  reValue: string;
  npmValue: string;
}) => {
  const [reApproving, setReApproving] = useState(false);
  const [npmApproving, setNPMApproving] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState({ npm: "", dai: "" });

  const [coverMinStake, setCoverMinStake] = useState<any>("0");

  const { networkId } = useNetwork();
  const { library, account } = useWeb3React();

  const { liquidityTokenAddress, NPMTokenAddress } = useAppConstants();

  const {
    allowance: reAllowance,
    loading: loadingReAllowance,
    refetch: updateReAllowance,
    approve: approveReAllowance,
  } = useERC20Allowance(liquidityTokenAddress);
  const {
    balance: reTokenBalance,
    loading: reTokenBalanceLoading,
    refetch: updateReTokenBalance,
  } = useERC20Balance(liquidityTokenAddress);

  const {
    allowance: npmAllowance,
    loading: loadingNPMAllowance,
    refetch: updateNPMAllowance,
    approve: approveNPMAllowance,
  } = useERC20Allowance(NPMTokenAddress);
  const {
    balance: npmBalance,
    loading: npmBalanceLoading,
    refetch: updateNpmBalance,
  } = useERC20Balance(NPMTokenAddress);

  const txToast = useTxToast();
  // const { invoke } = useInvokeMethod();
  const { notifyError } = useErrorNotifier();

  useEffect(() => {
    async function setMinValue() {
      try {
        const signerOrProvider = getProviderOrSigner(
          library,
          account ?? undefined,
          networkId
        );

        if (signerOrProvider?.provider) {
          const val = await getCoverMinStake(
            networkId,
            signerOrProvider.provider
          );
          setCoverMinStake(val);
        }
      } catch {}
    }
    setMinValue();
  }, [library, account, networkId]);

  useEffect(() => {
    const _npmError = isLessOrEqual(convertFromUnits(npmBalance), 0)
      ? "Balance not available"
      : isGreater(npmValue, convertFromUnits(npmBalance).toString())
      ? "Amount greater than balance"
      : isLessThan(npmValue, convertFromUnits(coverMinStake).toString())
      ? "Amount less than minimum stake"
      : isLessThan(
          convertFromUnits(npmBalance).toString(),
          convertFromUnits(coverMinStake).toString()
        )
      ? "Balance less than minimum stake"
      : "";

    const _daiError = isLessOrEqual(convertFromUnits(reTokenBalance), 0)
      ? "Balance not available"
      : isGreater(reValue, convertFromUnits(reTokenBalance).toString())
      ? "Amount greater than balance"
      : "";

    setError({ npm: _npmError, dai: _daiError });
  }, [npmValue, npmBalance, reTokenBalance, reValue, coverMinStake]);

  useEffect(() => {
    updateReAllowance(liquidityTokenAddress);
  }, [liquidityTokenAddress, updateReAllowance]);

  useEffect(() => {
    updateNPMAllowance(NPMTokenAddress);
  }, [NPMTokenAddress, updateNPMAllowance]);

  const handleReTokenApprove = async () => {
    setReApproving(true);

    const cleanup = () => {
      setReApproving(false);
    };

    const handleError = (err: any) => {
      notifyError(err, "approve DAI");
    };

    const onTransactionResult = async (tx: any) => {
      try {
        await txToast.push(tx, {
          pending: "Approving NPM",
          success: "Approved NPM Successfully",
          failure: "Could not approve NPM",
        });
        cleanup();
      } catch (err) {
        handleError(err);
        cleanup();
      }
    };

    const onRetryCancel = () => {
      cleanup();
    };

    const onError = (err: any) => {
      handleError(err);
      cleanup();
    };

    const reAmount = convertToUnits(reValue).toString();
    approveReAllowance(liquidityTokenAddress, reAmount, {
      onTransactionResult,
      onError,
      onRetryCancel,
    });
  };

  const handleNPMTokenApprove = async () => {
    setNPMApproving(true);

    const cleanup = () => {
      setNPMApproving(false);
    };
    const handleError = (err: any) => {
      notifyError(err, "approve NPM");
    };

    const onTransactionResult = async (tx: any) => {
      try {
        await txToast.push(tx, {
          pending: "Approving NPM",
          success: "Approved NPM Successfully",
          failure: "Could not approve NPM",
        });
        cleanup();
      } catch (err) {
        handleError(err);
        cleanup();
      }
    };

    const onRetryCancel = () => {
      cleanup();
    };

    const onError = (err: any) => {
      handleError(err);
      cleanup();
    };

    const npmAmount = convertToUnits(npmValue).toString();
    approveNPMAllowance(NPMTokenAddress, npmAmount, {
      onTransactionResult,
      onError,
      onRetryCancel,
    });
  };

  const handleCreateCover = async (coverInfo: ICoverInfo) => {
    if (!account || !networkId || !npmApproved || !reApproved) return;
    setCreating(true);

    const cleanup = () => {
      setCreating(false);
      updateNPMAllowance(NPMTokenAddress);
      updateNpmBalance();
      updateReAllowance(liquidityTokenAddress);
      updateReTokenBalance();
    };
    const handleError = (err: any) => {
      notifyError(err, "create cover");
    };

    const onTransactionResult = async (tx: any) => {
      try {
        await txToast.push(tx, {
          pending: "Creating Cover",
          success: "Created Cover Successfully",
          failure: "Could not create cover",
        });
        cleanup();
      } catch (err) {
        handleError(err);
        cleanup();
      }
    };

    try {
      const signerOrProvider = getProviderOrSigner(library, account, networkId);

      const tx = await cover.createCover(
        networkId,
        coverInfo,
        signerOrProvider
      );

      onTransactionResult(tx.result);
    } catch (err) {
      cleanup();
      handleError(err);
    }
  };

  const npmApproved =
    npmValue &&
    isValidNumber(npmValue) &&
    isGreater(convertFromUnits(npmAllowance).toString(), 0) &&
    isGreaterOrEqual(convertFromUnits(npmAllowance).toString(), npmValue);

  const reApproved =
    reValue &&
    isValidNumber(reValue) &&
    isGreater(convertFromUnits(reAllowance).toString(), 0) &&
    isGreaterOrEqual(convertFromUnits(reAllowance).toString(), reValue);

  return {
    npmApproving,
    npmApproved: npmApproved,
    npmBalance,
    npmBalanceLoading,
    updateNpmBalance,

    reApproving,
    reApproved: reApproved,
    reTokenBalance,
    reTokenBalanceLoading,
    updateReTokenBalance,

    error,
    coverMinStake,

    handleReTokenApprove,
    handleNPMTokenApprove,
    handleCreateCover,
    creating,
  };
};
