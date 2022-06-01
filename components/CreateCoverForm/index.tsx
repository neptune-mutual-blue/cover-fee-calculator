import { ApproveTokenInput } from "@components/ApproveTokenInput";
import { Checkbox } from "@components/Checkbox";
import Divider from "@components/Divider";
import FormInput from "@components/FormInput";
import { MultiInputField } from "@components/MulitInputField";
import { RegularButton } from "@components/RegularButton";
import { TagsInput } from "@components/TagsInput";
import { TagsSelect, TagValue } from "@components/TagsSelect";
import { VerticalTimeline } from "@components/VerticalTimeline";
// import { ICoverInfo } from "@neptunemutual/sdk/dist/types";
import { InfoIcon } from "@svg";
import { useAppConstants } from "@utils/app-constants/context";
import { allNullItemsArray, isEmptyVariable } from "@utils/functions";
import { convertFromUnits } from "@utils/functions/bn";
import { useCreateCover } from "@utils/hooks/useCreateCover";
import { useTokenSymbol } from "@utils/hooks/useTokenSymbol";
import { formatCurrency } from "@utils/methods";
import { FC, FormEvent, useCallback, useEffect, useState } from "react";

// import * as Tooltip from "@radix-ui/react-tooltip";
import { Tooltip } from "@components/common/Tooltip";
import { SVGCheckbox } from "@components/Checkbox/SVGCheckbox";
import useMediaQuery from "@utils/hooks/useMediaQuery";
import { Saved, SocialProfileSelect } from "@components/SocialProfileSelect";

interface FormData {
  coverName: string;
  projectName?: string;
  tags: string[];
  coverDescription: string;
  coverRules: string;
  coverExclusions: string;
  socialProfiles: Saved[];
  requiresWhitelist: boolean;
  networkList: { name: string; chainId?: number }[];
  floorRate: string;
  ceilingRate: string;
  reportingPeriod: string;
  cooldownPeriod: string;
  claimPeriod: string;
  minimumStake: string;
  resolutionResource: string[];
  npmStake: string;
  reassuranceAmount: string;
}

const BlockchainList = [
  { name: "Ethereum", chainId: 1 },
  { name: "BNB", chainId: 56 },
  { name: "Solana" },
  { name: "Terra" },
  { name: "Cardano" },
  { name: "Avalanche", chainId: 43114 },
  { name: "Polkadot" },
  { name: "NEAR Protocol" },
  { name: "Polygon", chainId: 137 },
  { name: "Chainlink" },
  { name: "TRON" },
  { name: "Ethereum Classic" },
  { name: "Algorand" },
  { name: "Stellar" },
  { name: "VeChain" },
];

const initialFormData = {
  coverName: "",
  projectName: "",
  tags: [],
  coverDescription: "",
  coverRules: "",
  coverExclusions: "",
  socialProfiles: [],
  requiresWhitelist: false,
  networkList: [],
  floorRate: "",
  ceilingRate: "",
  reportingPeriod: "",
  cooldownPeriod: "",
  claimPeriod: "",
  minimumStake: "",
  resolutionResource: [""],
  npmStake: "",
  reassuranceAmount: "",
};

export const CreateCoverForm: FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [tosApproved, setTosApproved] = useState(false);

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [showTooltip, setShowTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    npmApproving,
    npmApproved,
    npmBalance,
    // npmBalanceLoading,

    reApproving,
    reApproved,
    reTokenBalance,
    // reTokenBalanceLoading,

    coverMinStake,
    error,

    handleReTokenApprove,
    handleNPMTokenApprove,
    handleCreateCover,
  } = useCreateCover({
    coverKey: "asds",
    reValue: formData.reassuranceAmount,
    npmValue: formData.npmStake,
  });

  const { NPMTokenAddress, liquidityTokenAddress } = useAppConstants();
  const liquidityTokenSymbol = useTokenSymbol(liquidityTokenAddress);
  const npmTokenSymbol = useTokenSymbol(NPMTokenAddress);

  const balance = {
    npm: formatCurrency(
      parseFloat(convertFromUnits(npmBalance).toString()),
      npmTokenSymbol,
      true
    ).short,
    dai: formatCurrency(
      parseFloat(convertFromUnits(reTokenBalance).toString()),
      liquidityTokenSymbol,
      true
    ).short,
    minStake: formatCurrency(
      parseFloat(convertFromUnits(coverMinStake).toString()),
      npmTokenSymbol,
      true
    ).short,
  };

  const formatData = useCallback(() => {
    const _data: any = {};
    _data.key = formData.coverName.trim().toLowerCase().split(" ").join("-");
    _data.coverName = formData.coverName;
    _data.projectName = formData.projectName;
    _data.tags = formData.tags;
    _data.about = formData.coverDescription;
    _data.blockchains = formData.networkList;
    _data.rules = formData.coverRules;

    _data.links = {};
    enum links {
      "website",
      "documentation",
      "telegram",
      "twitter",
      "github",
      "facebook",
      "blog",
      "discord",
      "linkedin",
      "slack",
    }
    formData.socialProfiles.map((item, i) => (_data.links[links[i]] = item));

    _data.pricingFloor = formData.floorRate;
    _data.pricingCeiling = formData.ceilingRate;
    _data.reportingPeriod = formData.reportingPeriod;
    _data.cooldownPeriod = formData.cooldownPeriod;
    _data.claimPeriod = formData.claimPeriod;
    _data.minReportingStake = formData.minimumStake;
    _data.resolutionSources = formData.resolutionResource;
    _data.stakeWithFees = formData.npmStake;
    _data.reassurance = formData.reassuranceAmount;
    _data.initialLiquidity = "";
  }, [formData]);

  const isEmpty = {
    npm: !formData.npmStake || parseFloat(formData.npmStake) === 0,
    re:
      !formData.reassuranceAmount ||
      parseFloat(formData.reassuranceAmount) === 0,
  };

  useEffect(() => {
    const {
      coverName,
      tags,
      coverDescription,
      coverRules,
      socialProfiles,
      networkList,
      floorRate,
      ceilingRate,
      reportingPeriod,
      cooldownPeriod,
      claimPeriod,
      minimumStake,
      resolutionResource,
      npmStake,
      reassuranceAmount,
    } = formData;
    if (
      isEmptyVariable(
        coverName,
        coverDescription,
        coverRules,
        floorRate,
        ceilingRate,
        reportingPeriod,
        cooldownPeriod,
        claimPeriod,
        minimumStake,
        npmStake,
        reassuranceAmount,
        tosApproved,
        npmApproved,
        reApproved
      )
    )
      return setSubmitDisabled(true);

    if (!tags.length || !networkList.length || !socialProfiles.length)
      return setSubmitDisabled(true);

    if (resolutionResource.length && allNullItemsArray(resolutionResource))
      return setSubmitDisabled(true);

    setSubmitDisabled(false);
    formatData();
  }, [formData, tosApproved, npmApproved, reApproved, formatData]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleInputChange = (
    fieldName: keyof FormData,
    fieldValue: string | string[] | TagValue[] | boolean | Saved[]
  ) => {
    setFormData((val) => ({ ...val, [fieldName]: fieldValue }));
  };

  const period = {
    reporting: parseInt(formData.reportingPeriod || "0"),
    claim:
      parseInt(formData.cooldownPeriod || "0") +
      parseInt(formData.claimPeriod || "0"),
  };

  return (
    <div className="max-w-screen-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <FormInput
            label="Cover name"
            placeholder="Enter your cover name" // max 31 characters
            value={formData.coverName}
            setValue={(val) => handleInputChange("coverName", val)}
            type="text"
            required
          />

          <FormInput
            label="Project name"
            placeholder="Enter your project name" // max 31 characters
            value={formData.projectName || ""}
            setValue={(val) => handleInputChange("projectName", val)}
            type="text"
          />

          <TagsInput
            label="Tags"
            value={formData.tags}
            setValue={(val) => handleInputChange("tags", val)}
            placeholder="Tags"
            required
          />

          <FormInput
            label="Description"
            placeholder="Enter description of your project"
            value={formData.coverDescription}
            setValue={(val) => handleInputChange("coverDescription", val)}
            type="text"
            textfield
            textfieldSize="medium"
            required
          />

          <TagsSelect
            itemList={BlockchainList}
            label="Blockchain Network List"
            value={formData.networkList}
            placeholder="Enter the list of blockchain networks your app supports."
            setValue={(val) => handleInputChange("networkList", val)}
            required
          />

          <FormInput
            label="Cover Rules and Parameters"
            placeholder="Enter cover rules and parameters"
            value={formData.coverRules}
            setValue={(val) => handleInputChange("coverRules", val)}
            type="text"
            textfield
            required
          />

          <FormInput
            label="Cover Exclusions"
            placeholder="Enter cover exclusions"
            value={formData.coverExclusions}
            setValue={(val) => handleInputChange("coverExclusions", val)}
            type="text"
            textfield
            required
          />
        </div>

        <SocialProfileSelect
          value={formData.socialProfiles}
          setValue={(val) => handleInputChange("socialProfiles", val)}
          wrapperClass="mt-6"
          label="Social Profiles"
          required
        />

        <div className="flex items-center gap-2 py-4 mt-3">
          <SVGCheckbox
            checked={formData.requiresWhitelist}
            label="Requires Whitelist"
            labelClass="font-poppins leading-6"
            onChange={(checked) =>
              handleInputChange("requiresWhitelist", checked)
            }
            className="w-4 h-4"
          />
          <Tooltip
            text="If you select this checkbox, only pre-whitelisted addresses will
                be able to purchase covers. You can add multiple addresses to
                the whitelist after this cover is created."
            open={showTooltip}
            position={isMobile ? "bottom" : "right"}
          >
            <div
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <InfoIcon className="w-4 h-4 text-text-gray" />
            </div>
          </Tooltip>
        </div>

        <Divider className="mt-8" />

        <div className="mt-10">
          <div className="flex items-center">
            <h2 className="font-semibold text-heading2 text-prim-blue">
              Fine Tune the Premium Pricing
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-6 md:grid-cols-2">
            <FormInput
              label="Floor Rate"
              placeholder="0.00"
              value={formData.floorRate}
              setValue={(val) => handleInputChange("floorRate", val)}
              helpText="Enter the policy floor rate."
              numberFormat={false}
              required
            />
            <FormInput
              label="Ceiling Rate"
              placeholder="0.00"
              value={formData.ceilingRate}
              setValue={(val) => handleInputChange("ceilingRate", val)}
              helpText="Enter the policy ceiling rate."
              numberFormat={false}
              required
            />
          </div>
        </div>

        <Divider className="mt-10" />

        <div className="mt-10">
          <h2 className="font-semibold text-heading2 text-prim-blue">
            Configure Governance Parameters
          </h2>
          <div className="grid grid-cols-1 gap-8 mt-6 md:grid-cols-2">
            <FormInput
              label="Reporting Period"
              placeholder="No. of Days"
              value={formData.reportingPeriod}
              setValue={(val) => handleInputChange("reportingPeriod", val)}
              helpText="Min 7-day reporting period."
              required
            />
            <FormInput
              label="Cooldown Period"
              placeholder="No. of Days"
              value={formData.cooldownPeriod}
              setValue={(val) => handleInputChange("cooldownPeriod", val)}
              helpText="Resolution can only be achieved after the cooldown period."
              required
            />
            <FormInput
              label="Claim Period"
              placeholder="No. of Days"
              value={formData.claimPeriod}
              setValue={(val) => handleInputChange("claimPeriod", val)}
              helpText="Enter number of days during when people can claim."
              required
            />
            <FormInput
              label="Minimum Reporting Stake"
              placeholder="0.00"
              value={formData.minimumStake}
              setValue={(val) => handleInputChange("minimumStake", val)}
              helpText="Minimum amount of NPM tokens required to report incident"
              required
            />
          </div>
        </div>

        <Divider className="mt-12" />

        <div className="mt-10">
          <h2 className="font-semibold text-heading2 text-prim-blue">
            Reporting, Resolution, and Claim Period
          </h2>

          <VerticalTimeline
            items={[
              {
                innerLabel: "day 1",
                name: "start",
                periodInfo: "reporting",
              },
              {
                innerLabel: `day ${period.reporting + 1}`,
                name: "resolve",
                periodInfo: "claim Period",
              },
              {
                innerLabel: `day ${period.reporting + period.claim + 1}`,
                name: "finalize",
              },
            ]}
            className="max-w-screen-md mt-10"
          />

          <MultiInputField
            value={formData.resolutionResource}
            setValue={(val) => handleInputChange("resolutionResource", val)}
            label="Resolution Resource"
            helpText="Press the (+) to add more."
            className="mt-10"
            placeholder="https://"
            required
          />
        </div>

        <Divider className="mt-12" />

        <div className="mt-10">
          <h2 className="font-semibold text-heading2 text-prim-blue">
            {"Fee & Amount"}
          </h2>
          <ApproveTokenInput
            label="Npm Stake"
            placeholer="0.00"
            helpText={
              <span className="text-sm font-poppins">
                Balance: {balance.npm}
                {error.npm && (
                  <>
                    <br />
                    <span className="text-red-500 font-poppins">
                      {error.npm}
                    </span>
                  </>
                )}
                <br />
                Minimum Stake: {balance.minStake}
              </span>
            }
            value={formData.npmStake}
            setValue={(val) => handleInputChange("npmStake", val)}
            tokenName="NPM"
            disabled={npmApproving}
            disabledBtn={npmApproved || isEmpty.npm || Boolean(error.npm)}
            handleCLick={() => handleNPMTokenApprove()}
            className="mt-6"
            btnText={
              npmApproved
                ? "Approved"
                : npmApproving
                ? "Approving NPM"
                : undefined
            }
            required
          />
          <ApproveTokenInput
            label="Reassurance Amount"
            placeholer="0.00"
            helpText={
              <span className="text-sm font-poppins">
                Balance: {balance.dai}
                {error.dai && (
                  <>
                    <br />
                    <span className="text-red-500 font-poppins">
                      {error.dai}
                    </span>
                  </>
                )}
              </span>
            }
            value={formData.reassuranceAmount}
            setValue={(val) => handleInputChange("reassuranceAmount", val)}
            tokenName="DAI"
            disabled={reApproving}
            disabledBtn={isEmpty.re || reApproved || Boolean(error.dai)}
            handleCLick={() => handleReTokenApprove()}
            className="mt-12"
            btnText={
              reApproved
                ? "Approved"
                : reApproving
                ? "Approving DAI"
                : undefined
            }
            required
          />
        </div>

        <div className="mt-18">
          <Checkbox
            id="test"
            checked={tosApproved}
            size="lg"
            onChange={(checked) => setTosApproved(checked)}
            wrapperClass="items-stretch"
            label={
              <span className="leading-6 font-poppins">
                I have read, understood, and agree to{" "}
                <a
                  href="https://docs.neptunemutual.com/usage/terms-of-use"
                  target={"_blank"}
                  rel="noreferrer"
                  className="underline"
                >
                  the terms of service
                </a>
                .
              </span>
            }
          />
        </div>

        <RegularButton
          text={`Create ${formData.coverName || "Cover"}`}
          type="submit"
          className="w-full mt-8 py-btn-y px-btn-x sm:px-16 lg:px-btn-x sm:w-auto"
          disabled={submitDisabled}
        />
      </form>
    </div>
  );
};
