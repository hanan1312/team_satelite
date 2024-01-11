import { useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import Placeholder from "../../undraw_outer_space_re_u9vd.svg";
import Image from "next/image";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function Satalites({
  satellites = [],
  nextStep,
  prevStep,
  onSelectedSatelite,
}) {
  const [selectedSatalite, setSelectedSatalite] = useState(satellites[0]);

  const handleSelectedSatelite = (satalite) => {
    setSelectedSatalite(satalite);
    onSelectedSatelite(satalite);
  };

  useEffect(() => {
    onSelectedSatelite(selectedSatalite);
  }, []);
// console.log(satellites,'test satalites')
  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow">
      <div className="flex flex-1 px-4 py-5 sm:p-6">
        <RadioGroup
          value={selectedSatalite}
          onChange={handleSelectedSatelite}
          className="flex flex-col flex-1"
        >
          <RadioGroup.Label className="text-2xl font-bold text-gray-800 text-start">
            Select a satellite
          </RadioGroup.Label>

          {satellites.length > 0 ? (
            <div className="grid grid-cols-1 mt-4 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
              {satellites.map((satalite) => (
                <RadioGroup.Option
                  key={satalite.id}
                  value={satalite}
                  className={({ checked, active }) =>
                    classNames(
                      checked ? "border-transparent" : "border-gray-300",
                      active ? "border-indigo-600 ring-2 ring-indigo-600" : "",
                      "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                    )
                  }
                >
                  {({ checked, active }) => (
                    <>
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <RadioGroup.Label
                            as="span"
                            className="block text-sm font-medium text-gray-900"
                          >
                            {satalite.title}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className="flex items-center mt-1 text-sm text-gray-500"
                          >
                            {satalite.description}
                          </RadioGroup.Description>
                          <RadioGroup.Description
                            as="span"
                            className="mt-6 text-sm font-medium text-gray-900"
                          >
                            {/* {new Intl.NumberFormat().format( */}
                            {satalite.additional}
                            {/* )}{" "} */}
                            {/* Pass(es) */}
                          </RadioGroup.Description>
                        </span>
                      </span>
                      <CheckCircleIcon
                        className={classNames(
                          !checked ? "invisible" : "",
                          "h-5 w-5 text-indigo-600"
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={classNames(
                          active ? "border" : "border-2",
                          checked ? "border-indigo-600" : "border-transparent",
                          "pointer-events-none absolute -inset-px rounded-lg"
                        )}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-10 h-96">
              <p className="text-lg font-bold text-center text-gray-600">
                No satellites here
              </p>
              <Image
                src={Placeholder}
                alt="illustration"
                className="object-contain w-full max-h-48"
              />
            </div>
          )}
        </RadioGroup>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-end gap-x-6">
          {prevStep ? (
            <button
              onClick={prevStep}
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Previous
            </button>
          ) : null}

          {nextStep ? (
            <button
              onClick={nextStep}
              type="submit"
              className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Next
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
