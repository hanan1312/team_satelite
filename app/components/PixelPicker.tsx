import React, { useState, useRef } from "react";
import { Popover } from "@headlessui/react";
import { usePopper } from "react-popper";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function PixelPicker({
  xCount,
  yCount,
  onSquaresSelect = (selectedSquares) => {},
}) {
  const [selectedSquares, setSelectedSquares] = useState([]);
  let referenceElement = useRef(null);
  let popperElement = useRef(null);
  let { styles, attributes } = usePopper(
    referenceElement.current,
    popperElement.current
  );

  const [isViewMore, setIsViewMore] = useState(false);

  // Determine the number of items to show in "View Less" mode
  const itemsToShow = 4;

  // Determine the list to show based on the isViewMore state
  const listToShow = isViewMore
    ? selectedSquares
    : selectedSquares.slice(0, itemsToShow);

  const handleSquareClick = (x, y, event) => {
    const index = selectedSquares.findIndex(
      (square) => square.x === x && square.y === y
    );
    const isSquareSelected = index !== -1;
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      // If the Command key or Ctrl key is pressed, select all squares before the current one
      if (selectedSquares.length && index === -1) {
        setSelectedSquares([]);
      } else {
        setSelectedSquares(
          Array.from({ length: yCount }, (_, yi) =>
            Array.from({ length: xCount }, (_, xi) => ({ x: xi, y: yi }))
          )
            .flat()
            .filter(
              (square) => square.y < y || (square.y === y && square.x <= x)
            )
            .map((square) => {
              const isCurrentSquare = square.x === x && square.y === y;
              return isCurrentSquare
                ? { x, y, selected: !isSquareSelected }
                : square;
            })
        );
      }
    } else {
      if (isSquareSelected) {
        // If the square is already selected, remove it from the array
        setSelectedSquares(selectedSquares.filter((_, i) => i !== index));
      } else {
        // If the square is not selected, add it to the array
        setSelectedSquares([...selectedSquares, { x, y }]);
      }
    }
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button ref={referenceElement}>
            <button className="bg-gray-50 whitespace-nowrap border items-center justify-between gap-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              Error position
              <ChevronDownIcon
                width={20}
                height={20}
                className={
                  open
                    ? "rotate-180 transform transition-all"
                    : "transition-all"
                }
              />
            </button>
          </Popover.Button>
          <Popover.Panel
            ref={popperElement}
            className="absolute right-0 z-10 p-2 mt-2 bg-white border border-gray-200 rounded-sm"
          >
            {selectedSquares.length > 0 && (
              <div className="mb-2 text-sm font-semibold text-gray-600">
                Selected Errors:
                <div className="flex flex-wrap gap-1 pt-2 text-xs">
                  {listToShow.map((square, index) => (
                    <div
                      className=" rounded bg-gray-100 border border-gray-300 p-0.5"
                      key={index}
                    >{`(${square.y},${square.x})`}</div>
                  ))}
                  {selectedSquares.length > itemsToShow && !isViewMore && (
                    <div>...</div>
                  )}
                  {selectedSquares.length > itemsToShow && (
                    <button
                      className="text-blue-500"
                      onClick={() => setIsViewMore(!isViewMore)}
                    >
                      {isViewMore ? "View Less" : "View More"}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className=" flex gap-0.5 flex-col">
              {Array.from({ length: yCount }, (_, y) => (
                <div
                  key={y}
                  className="flex gap-0.5"
                >
                  {Array.from({ length: xCount }, (_, x) => (
                    <div
                      key={x}
                      onClick={(event) => handleSquareClick(x, y, event)}
                      className={`w-6 h-6 group rounded-sm border flex items-center justify-center border-gray-400 cursor-pointer text-[7px] ${
                        selectedSquares.some(
                          (square) => square.x === x && square.y === y
                        )
                          ? "bg-red-500"
                          : "bg-white"
                      }`}
                    >
                      <span className="transition-opacity opacity-0 group-hover:opacity-100">
                        {`(${y},${x})`}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 pt-5">
              <button
                onClick={() => {
                  setSelectedSquares([]);
                  onSquaresSelect([]);
                  close();
                }}
                className="px-3 py-2 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  onSquaresSelect(selectedSquares);
                  close();
                }}
                className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Apply
              </button>
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
}

export default PixelPicker;
