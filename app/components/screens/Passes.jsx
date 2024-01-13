function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
import { useState, useEffect, use } from "react";
import moment from "moment";
import Placeholder from "../../undraw_outer_space_re_u9vd.svg";
import Image from "next/image";

export default function Locations({
  nextStep,
  prevStep,
  satalite,

  onSelectedLocation,
  selectPass = (pass) => {},
}) {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(100);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [hasError, setHasError] = useState("all");
  

  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date("1/1/2021").toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const applyStartDate = (date) => {
    setStartDate(new Date(date).toISOString().split("T")[0]);
    // fetchPasses();
  };
  const applyEndDate = (date) => {
    setEndDate(new Date(date).toISOString().split("T")[0]);
    // fetchPasses();
  };

  const fetchPasses = async () => {
    setLoading(true);
    const baseUrl = "/api/passes";
    const params = {
      page: page,
      limit: 100,
      sat_name: satalite.id,
      startTime: startDate,
      endTime: endDate,
      has_error: hasError,
      
    };
    const url = new URL(baseUrl, document.baseURI);
  
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);

    if (response.ok) {
      // setData(await response.json());

      // await response.json then execute the following
      let passes = await response.json();
   
      // console.log(passes);

      const tempData = [];

      passes.passes.forEach((pass) => {
        let parts = pass.image_name.split("_");

       
        // let passDate = moment(pass.Pass_Date, "YYYY-MM-DD HH:mm:ss").format(
        //   "MM/DD/YYYY h:mm a"
        // );

        let processedDate = moment(
          parts[parts.length - 1],
          "YYYY-MM-DD-HH:mm:ss"
        ).format("MM/DD/YYYY h:mm a");

        let error_start_time = moment(
          pass.error_start_time,
          "YYYY-MM-DD-HH:mm:ss"
        ).format("MM/DD/YYYY h:mm a");

        let error_end_time = moment(
          pass.error_end_time,
          "YYYY-MM-DD-HH:mm:ss"
        ).format("MM/DD/YYYY h:mm a");

        pass.error_start_time = error_start_time;

        pass.error_end_time = error_end_time;

        tempData.push({
          // passDate: passDate,
          processedDate: processedDate,
          ...pass,
        });
      });

      setDisplayData(tempData);

      setData(passes);

      setLoading(false);

      const totalPages = Math.ceil(passes?.count / 100);
      setPageNumbers(generatePageNumbers(page, totalPages));
    } else {
      setError(await response.json());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();

    let tempData = [];
  }, [page, startDate, endDate, hasError]);

  const handleNext = () => {
    setPage(page + 1);
  };

  const handleSetPage = (pageTo) => {
    setPage(pageTo);
  };

  const handlePrev = () => {
    setPage(page - 1);
  };

  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = new Set();
    pages.add(1);
    let startPage = Math.max(2, currentPage - 4);
    let endPage = Math.min(totalPages - 1, currentPage + 4);

    if (currentPage <= 5) {
      endPage = Math.min(totalPages - 1, 9);
    } else if (currentPage > totalPages - 5) {
      startPage = Math.max(2, totalPages - 8);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.add(i);
    }

    pages.add(totalPages);
    return pages.size == 0 ? [1] : Array.from(pages);
  };

  return (
    <div className="flex flex-col flex-1 w-full max-h-full overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow">
      <div className="flex-1 py-5 sm:p-6">
        <div>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-bold text-gray-800 text-start">
                Passes
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all the passes for {satalite.title}.
              </p>
            </div>
            <div className="flex flex-row-reverse items-center justify-end gap-4 mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <div className="flex items-center">
                <span className="mx-4 text-gray-500">Pass Date:</span>
                <div className="relative">
                  <input
                    name="start"
                    type="date"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Select date start"
                    value={startDate}
                    onChange={(e) => {
                      applyStartDate(e.target.value);
                    }}
                  />
                </div>
                <span className="mx-4 text-gray-500">to</span>
                <div className="relative">
                  <input
                    name="end"
                    type="date"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Select date end"
                    value={endDate}
                    onChange={(e) => {
                      applyEndDate(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-start gap-4">
                <label
                  className="text-gray-500"
                  htmlFor="hasError"
                >
                  Has Error:
                </label>
                <div className="relative">
                  <select
                    name="hasError"
                    id="hasError"
                    className="bg-gray-50 border pr-8 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={hasError}
                    onChange={(e) => {
                      setHasError(e.target.value);
                    }}
                  >
                    <option value="all">All</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flow-root mt-8">
            <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
              <div className="relative inline-block min-w-full py-2 align-middle">
                {loading ? (
                  <div className="absolute inset-0 z-50 flex items-center justify-center w-full h-full pt-20 bg-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-loader-2 animate-spin"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        stroke="none"
                        d="M0 0h24v24H0z"
                        fill="none"
                      />
                      <path d="M12 3a9 9 0 1 0 9 9" />
                    </svg>
                  </div>
                ) : data?.count > 0 ? (
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 w-1 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          Pass ID
                        </th>
                        {/* <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          Pass Date
                        </th> */}
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          Processing Date
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          local_folder_name
                        </th>
                        {/* <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                          <span className="sr-only">Action</span>
                        </th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {displayData?.map((pass, idx) => (
                        <tr
                          className="transition duration-150 ease-in-out cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            selectPass(pass);
                            // setPass(pass);
                            // setModal(true);
                          }}
                          key={idx}
                        >
                          <td
                            className={classNames(
                              idx !== displayData.length - 1
                                ? "border-b border-gray-200"
                                : "",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                            )}
                          >
                            {idx + 1}
                          </td>
                          <td
                            className={classNames(
                              idx !== displayData.length - 1
                                ? "border-b border-gray-200"
                                : "",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                            )}
                          >
                            {pass.Pass_ID == "Invalid date"
                              ? "N/A"
                              : pass.Pass_ID }
                          </td>
                          {/* <td
                            className={classNames(
                              idx !== displayData.length - 1
                                ? "border-b border-gray-200"
                                : "",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                            )}
                          >
                            {pass.passDate == "Invalid date"
                              ? "N/A"
                              : pass.passDate}
                          </td> */}
                          <td
                            className={classNames(
                              idx !== displayData.length - 1
                                ? "border-b border-gray-200"
                                : "",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                            )}
                          >
                            {pass.processedDate}
                          </td>
                          <td
                            className={classNames(
                              idx !== displayData.length - 1
                                ? "border-b border-gray-200"
                                : "",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8 overflow-ellipsis line-clamp-1"
                            )}
                          >
                            {pass.s3_path ?? "N/A"}
                          </td>
                          {/* <td
                            className={classNames(
                              idx !== displayData.length - 1
                                ? "border-b border-gray-200"
                                : "",
                              "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
                            )}
                          >
                            <button
                              onClick={() => {
                                selectPass(pass);
                                // setPass(pass);
                                // setModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 gap-10 h-96">
                    <p className="text-lg font-bold text-center text-gray-600">
                      No passes here
                    </p>
                    <Image
                      src={Placeholder}
                      alt="illustration"
                      className="object-contain w-full max-h-48"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {data?.passes && data?.count > 0 ? (
        <div className="px-4 py-4 sm:px-6">
          <nav
            className="flex items-center justify-between px-4 py-3 bg-white sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                page <span className="font-bold">{page}</span> of{" "}
                <span className="font-bold">
                  {parseInt(data?.count / 100) + 1}
                </span>{" "}
                of <span className="font-bold">{data?.count}</span> total
                results
              </p>
            </div>
            <div className="flex justify-between flex-1 gap-2 sm:justify-end">
              <button
                onClick={handlePrev}
                disabled={page <= 1}
                className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
              >
                Previous
              </button>
              {pageNumbers.map((pageNum, idx) => (
                <>
                  {idx > 0 && pageNumbers[idx - 1] < pageNum - 1 && (
                    <span>...</span>
                  )}
                  <button
                    key={pageNum}
                    onClick={() => handleSetPage(pageNum)}
                    disabled={pageNum === page}
                    className={`relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md ${
                      pageNum === page
                        ? "disabled:opacity-50 disabled:cursor-not-allowed"
                        : ""
                    } ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0`}
                  >
                    {pageNum}
                  </button>
                </>
              ))}
              <button
                onClick={handleNext}
                disabled={page >= data?.count / 100}
                className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
              >
                Next
              </button>
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
