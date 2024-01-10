"use client";

import { useState, useEffect } from "react";

export default function Steps({ steps, activeStep = 0, onStepChange }) {
  const [_activeStep, setActiveStep] = useState(0);

  const [_steps, setSteps] = useState([]);

  const InitalizeSteps = () => {
    const stepsArr = [];

    steps.forEach((step, index) => {
      stepsArr.push({
        index,
        id: step.id,
        name: step.name,
        breadcrumb: step.breadcrumb,
        active: index === activeStep ? true : false,
        status:
          index === activeStep
            ? "current"
            : index < activeStep
            ? "completed"
            : "upcoming",
      });
    });

    setSteps(stepsArr);
  };

  const updateActiveStep = (index) => {
    setSteps((prevSteps) => {
      return prevSteps.map((step) => {
        if (step.index === index) {
          return { ...step, active: true, status: "current" };
        } else if (step.index < index) {
          return { ...step, active: false, status: "completed" };
        } else {
          return { ...step, active: false, status: "upcoming" };
        }
      });
    });
  };

  useEffect(() => {
    InitalizeSteps();
  }, [steps]);

  // Update the active step when the activeStep prop changes
  useEffect(() => {
    setActiveStep(activeStep);
    updateActiveStep(activeStep);
  }, [activeStep]);

  const handleSetActiveStep = (index) => {
    if (index === _activeStep) return;
    updateActiveStep(index);
    onStepChange(index);
  };

  return (
    <nav
      className="w-full"
      aria-label="Progress"
    >
      <ol
        role="list"
        className="gap-y-4 md:flex md:gap-x-3 md:space-y-0"
      >
        {_steps.map((step) => (
          <>
            <li
              key={step.name}
              className="md:flex-1"
            >
              {step.active ? (
                <button
                  onClick={() => handleSetActiveStep(step.index)}
                  className="flex flex-col w-full py-2 pl-4 transition-all border-l-4 border-indigo-600 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-indigo-600">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                  {step.breadcrumb && (
                    <span
                      title={step.breadcrumb}
                      className="flex-1 text-sm max-w-[200px] font-medium text-indigo-600 truncate"
                    >
                      {step.breadcrumb}
                    </span>
                  )}
                </button>
              ) : step.status === "completed" ? (
                <div className="flex items-center justify-start gap-4">
                  <button
                    onClick={() => handleSetActiveStep(step.index)}
                    className="flex flex-col w-full py-2 pl-4 transition-all border-l-4 border-indigo-600 group hover:border-indigo-800 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  >
                    <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-800">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                    {step.breadcrumb && (
                      <span
                        title={step.breadcrumb}
                        className="flex-1 text-sm max-w-[200px] font-medium text-indigo-600 truncate"
                      >
                        {step.breadcrumb}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  onClick={() => handleSetActiveStep(step.index)}
                  className="flex flex-col w-full py-2 pl-4 transition-all border-l-4 border-gray-200 cursor-not-allowed group hover:border-gray-300 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                >
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
              )}
            </li>
            <li
              className={
                step.status == "completed"
                  ? "text-indigo-600 flex items-center"
                  : "text-transparent flex items-center"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"
                ></path>
                <path d="M11 4l3 8l-3 8"></path>
              </svg>
            </li>
          </>
        ))}
      </ol>
    </nav>
  );
}
