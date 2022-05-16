import { CreateCoverForm } from "@components/CreateCoverForm";
import { LeftArrow } from "@svg";
import { FC } from "react";

interface CreateCoverProps {}

export const CreateCover: FC<CreateCoverProps> = ({}) => {
  return (
    <div className="grid grid-cols-12 pl-4 pr-10 bg-prim-gray sm:px-14 lg:px-28 pt-50px pb-150px">
      <div className="flex flex-col col-span-12 gap-6 lg:col-span-7">
        <div className="flex justify-between">
          <h1 className="font-bold text-prim-blue text-heading">
            Create New Cover
          </h1>
        </div>
        <CreateCoverForm />
      </div>
    </div>
  );
};
