function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
import { useState, useEffect, useMemo } from "react";
import { constructS3Url, constructMainEC2Url } from "../../../lib/utils";
import moment from "moment";
import Magnify from "../Magnify";
import PixelPicker from "../PixelPicker";
import Placeholder from "../../undraw_outer_space_re_u9vd.svg";
import Image from "next/image";

export default function Preview({ nextStep, prevStep, pass, selectError }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSquares, setSelectedSquares] = useState([]);
  const excludeKeys = [
    "image_name",
    "s3_path",
    "original_img",
    "sat_name",
    "local_folder_name",
    "Pass_Date",
  ];
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(100);
  const [imageUrl, setImageUrl] = useState(null);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [startDate, setStartDate] = useState(new Date("1/1/2021"));
  const now = new Date();
  const [endDate, setEndDate] = useState(
    new Date(now.setHours(23, 59, 59, 999))
  );
  const [[x, y], setMaxCoords] = useState([0, 0]);
  const handleSelectedSquares = (squares) => {
    setSelectedSquares(squares);
  };
  const applyStartDate = (date) => {
    setStartDate(date);
    // fetchPasses();
  };
  const applyEndDate = (date) => {
    setEndDate(date);
    // fetchPasses();
  };

  const calculateFromTo = () => {
    // if (data?.data?.data) {
    const fromCalc = (page - 1) * 100 + 1;
    setFrom(fromCalc);

    const toFactor = data?.data?.data.length ?? 100;

    const toCalc = fromCalc + toFactor - 1;
    setTo(toCalc);
    // }
  };

  const fetchPasses = async () => {
    setLoading(true);

    const baseUrl = "/api/single-pass";

    let startDateISO = new Date("1/1/1999").toISOString();
    let endDateISO = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    if (!isNaN(new Date(startDate).getTime())) {
      const startDateObj = new Date(startDate);
      startDateObj.setMinutes(
        startDateObj.getMinutes() - startDateObj.getTimezoneOffset()
      );
      startDateISO = startDateObj.toISOString();
    }

    if (!isNaN(new Date(endDate).getTime())) {
      const endDateObj = new Date(endDate);
      endDateObj.setMinutes(
        endDateObj.getMinutes() - endDateObj.getTimezoneOffset()
      );
      endDateISO = endDateObj.toISOString();
    }

    const params = {
      page: page,
      image_name: pass.image_name,
      startDate: startDateISO,
      endDate: endDateISO,
    };

    console.log(params);

    const url = new URL(baseUrl, document.baseURI);

    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedSquares: selectedSquares }),
    });

    if (response.ok) {
      let resData = await response.json();

      resData.data.data = resData.data.data.map((item, index) => {
        // item.s3_path = constructS3Url(item.s3_path, item.image_name);

        let error_start_time = moment(
          item.error_start_time,
          "YYYY-MM-DD-HH:mm:ss"
        ).format("MM/DD/YYYY h:mm:ss a");

        let error_end_time = moment(
          item.error_end_time,
          "YYYY-MM-DD-HH:mm:ss"
        ).format("MM/DD/YYYY h:mm:ss a");

        // console.log(error_start_time, error_end_time);

        //@ts-ignore
        resData.data.data[index]["error_start_time"] = error_start_time;
        //@ts-ignore
        resData.data.data[index]["error_end_time"] = error_end_time;
        item = {
          ID: item.ID,
          s3_path: item.s3_path,
          image_name: item.image_name,
          // original_img: item.original_img,
          "Pass date": pass.passDate,
          "Processed date": pass.processedDate,
          error_type: item.error_type,
          error_start_time: error_start_time,
          error_end_time: error_end_time,
          sub_img_loc_h: item.sub_img_loc_h,
          sub_img_loc_w: item.sub_img_loc_w,
          num_errors_raw: item.num_errors_raw,
          sub_img_error_start_pix: item.sub_img_error_start_pix,
          sub_img_error_end_pix: item.sub_img_error_end_pix,
          pic_size_h_pix: item.pic_size_h_pix,
          pic_size_w_pix: item.pic_size_w_pix,
          sub_img_count_h: item.sub_img_count_h,
          sub_img_count_w: item.sub_img_count_w,
          ...item,
        };
        return item;
      });

      if (x == 0 && y == 0) {
        setMaxCoords([
          (resData?.data?.data[0]?.sub_img_count_w ?? 0) + 1,
          (resData?.data?.data[0]?.sub_img_count_h ?? 0) + 1,
        ]);
      }

      // console.log(resData);

      setData({
        ...resData,
      });

      setTimeout(() => {
        const url = resData?.data?.data[0]?.s3_path
          ? constructMainEC2Url(
              resData?.data?.data[0]?.s3_path,
              pass.image_name
            )
          : null;
        setImageUrl(url);
      }, 800);

      const totalPages = Math.ceil(resData?.data?.count / 100);
      setPageNumbers(generatePageNumbers(page, totalPages));

      setLoading(false);
    } else {
      setError(await response.json());
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchPasses();
    console.log({
      page,
      startDate,
      endDate,
      selectedSquares,
    });
  }, [page, startDate, endDate, selectedSquares]);

  const tableRows = useMemo(() => {
    if (!data?.data?.data || data.data.data.length == 0) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 w-full gap-10 h-96">
          <p className="text-lg font-bold text-center text-gray-600">
            No errors here
          </p>
          <Image
            src={Placeholder}
            alt="illustration"
            className="object-contain w-full max-h-48"
          />
        </div>
      );
    }

    return data.data.data.map((pass, idx) => {
      const rowClassNames = classNames(
        "transition duration-150 ease-in-out cursor-pointer hover:bg-gray-50"
      );
      const cellClassNames = classNames(
        idx !== data?.data?.data.length - 1 ? "border-b border-gray-200" : "",

        "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
      );

      return (
        <tr
          className={rowClassNames}
          onClick={() => {
            selectError(pass);
          }}
        >
          <td className={cellClassNames}>{pass.ID}</td>
          <td className={cellClassNames}>{pass["Pass date"]}</td>
          <td className={cellClassNames}>{pass["Processed date"]}</td>
          <td className={cellClassNames}>{pass.error_type}</td>
          <td className={cellClassNames}>{pass.error_start_time}</td>
          <td className={cellClassNames}>{pass.error_end_time}</td>
          <td className={cellClassNames}>{pass.sub_img_loc_h}</td>
          <td className={cellClassNames}>{pass.sub_img_loc_w}</td>
          <td className={cellClassNames}>{pass.num_errors_raw}</td>
          <td className={cellClassNames}>{pass.sub_img_error_start_pix}</td>
          <td className={cellClassNames}>{pass.sub_img_error_end_pix}</td>
          <td className={cellClassNames}>{pass.pic_size_h_pix}</td>
          <td className={cellClassNames}>{pass.pic_size_w_pix}</td>
          <td className={cellClassNames}>{pass.sub_img_count_h}</td>
          <td className={cellClassNames}>{pass.sub_img_count_w}</td>
        </tr>
      );
    });
  }, [data, selectError]);
  const tableHeaders = useMemo(() => {
    if (!data?.data?.data || !data?.data?.data[0]) {
      return null;
    }

    return Object.keys(data.data.data[0]).map((key, idx) => {
      if (excludeKeys.includes(key)) {
        return null;
      }

      return (
        <th
          key={idx + "th"}
          scope="col"
          className="whitespace-nowrap top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
        >
          {key}
        </th>
      );
    });
  }, [data, excludeKeys]);
  return (
    <div className="flex flex-col flex-1 w-full max-h-full bg-white divide-y divide-gray-200 rounded-lg shadow">
      <div className="flex-1 py-5 sm:p-6">
        <div>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-bold text-gray-800 text-start">
                Select Error
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                {pass.image_name}'s Errors.
              </p>
            </div>
          </div>
          <div className="flow-root mt-8">
            <div className="-mx-4">
              <div className="relative inline-block w-full max-w-full py-2 align-middle">
                {imageUrl ? (
                  <div className="container flex items-center justify-center py-5 mx-auto">
                    <Magnify
                      imageLink={imageUrl}
                      originalHeight={pass.pic_size_h_pix}
                      originalWidth={pass.pic_size_w_pix}
                    />
                  </div>
                ) : null}

                <div className="relative z-10 flex items-center justify-between p-4">
                  <div className="flex items-center justify-start gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 ">Error Start date</span>
                      <div className="relative">
                        <input
                          name="start"
                          type="datetime-local"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Select date start"
                          value={startDate}
                          onChange={(e) => {
                            applyStartDate(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 ">Error End date</span>
                      <div className="relative">
                        <input
                          name="end"
                          type="datetime-local"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Select date end"
                          value={endDate}
                          onChange={(e) => {
                            applyEndDate(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-5">
                    <span className="text-gray-500">Error positions</span>
                    <PixelPicker
                      xCount={x}
                      yCount={y}
                      onSquaresSelect={handleSelectedSquares}
                    />
                  </div>
                </div>

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
                ) : (
                  <div>
                    <div className="w-full overflow-auto">
                      {data?.data?.data && data?.data?.data.length > 0 && (
                        <table className="border-separate border-spacing-0">
                          <thead>{tableHeaders}</thead>
                          <tbody className="w-full">{tableRows}</tbody>
                        </table>
                      )}
                      {data?.data?.data && data?.data?.data.length == 0 && (
                        <div className="flex flex-col items-center justify-center flex-1 w-full gap-10 py-40 h-96">
                          <p className="text-lg font-bold text-center text-gray-600">
                            No errors here
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {data?.data?.data && data?.data?.count > 0 ? (
        <div className="px-4 py-4 sm:px-6">
          <nav
            className="flex items-center justify-between px-4 py-3 bg-white sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                page <span className="font-bold">{page}</span> of{" "}
                <span className="font-bold">
                  {parseInt(data?.data?.count / 100) + 1}
                </span>{" "}
                of <span className="font-bold">{data?.data?.count}</span> total
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
                disabled={page >= data?.data?.count / 100}
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
