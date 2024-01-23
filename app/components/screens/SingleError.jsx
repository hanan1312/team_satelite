function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
import { useState, useEffect, use } from "react";
import {
  constructMainEC2Url,
  constructS3Url,
  constructSubEC2Url,
} from "../../../lib/utils";
import MagnifyImage from "../Magnify";
export default function Preview({ nextStep, prevStep, pass, error }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [errImageUrl, setErrImageUrl] = useState(null);

  const excludeKeys = ["Pass date", "Processed date"];

  // let test =  Object.entries(error)
  //   .filter(([key]) => !excludeKeys.includes(key))
  //   .map(([key, value]) => {
  //     console.log([key, value],'test value')
  //   })

  useEffect(() => {
    setTimeout(() => {
      setImageUrl(constructMainEC2Url(error.s3_path, error.image_name,error.Pass_ID));
      setErrImageUrl(
        constructSubEC2Url(
          error.s3_path,
          error.image_name,
          error.Pass_ID,
          error.sub_img_loc_h,
          error.sub_img_loc_w
        )
      );
    }, 300);
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full max-h-full overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow">
      <div className="flex-1 py-5 sm:p-6">
        <div>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-bold text-gray-800 text-start">
                Preview
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Preview for error #{error.ID}.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full px-4 py-4 sm:px-6">
        <div className="flex items-center flex-1 min-w-0">
         
          <div className="flex-shrink-0">
            <img
              className="w-12 h-12 rounded-full"
              src={imageUrl}
              alt=""
            />
          </div>
          <div className="flex-1 min-w-0 px-4 md:grid md:grid-cols-2 md:gap-4">
            <div>
              <div className="flex text-sm font-medium text-gray-900 truncate">
                <span className="truncate">{error.image_name}</span>
              </div>
              <p className="flex items-center mt-2 text-sm text-gray-500">
                <span className="truncate">{error.sat_name}</span>
              </p>
              <p className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="truncate">Pass on: {error["Pass date"]}</span>
                <span className="truncate">
                  Processed on: {error["Processed date"]}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={prevStep}
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 w-full">
        <div className="container flex items-center justify-between w-full gap-5">
          {/* {imageUrl && (
            <MagnifyImage
              imageLink={imageUrl}
              originalHeight={error.pic_size_h_pix}
              originalWidth={error.pic_size_w_pix}
            />
          )}
          {errImageUrl && (
            <MagnifyImage
              imageLink={errImageUrl}
              originalHeight={error.pic_size_h_pix}
              originalWidth={error.pic_size_w_pix}
            />
          )} */}

          <img
            className="flex-1 object-cover w-1/2"
            src={imageUrl}
          />
          <img
            className="flex-1 object-cover w-1/2"
            src={errImageUrl}
          />
        </div>
      </div>

      <ul className="flex flex-col flex-1 w-full max-h-full overflow-hidden bg-white divide-y divide-gray-200 shadow">
        {Object.entries(error)
          .filter(([key]) => !excludeKeys.includes(key))
          .map(([key, value]) => {
            return (
              <li
                key={key}
                className="px-4 py-4 sm:px-6"
              >
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div className="flex-1 min-w-0 px-4 md:gap-4">
                    <div>
                      <div className="flex text-sm font-medium text-gray-900 truncate">
                        <span className="truncate">{key}</span>
                      </div>
                      <p className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="truncate">{value ?? "N/A"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
