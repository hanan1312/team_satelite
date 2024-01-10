import React, { useState, useRef } from "react";

const MagnifyImage = ({ imageLink, originalWidth, originalHeight }) => {
  const [magnifiedX, setMagnifiedX] = useState(null);
  const [magnifiedY, setMagnifiedY] = useState(null);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - left) / width;
    const offsetY = (e.clientY - top) / height;
    setMagnifiedX(offsetX);
    setMagnifiedY(offsetY);
  };

  const handleMouseLeave = () => {
    setMagnifiedX(null);
    setMagnifiedY(null);
  };

  const isHovered = magnifiedX !== null && magnifiedY !== null;

  return (
    <div
      className="magnify-image"
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative"
        ref={containerRef}
      >
        <div
          className="image-container"
          onMouseMove={handleMouseMove}
        >
          <img
            src={imageLink}
            alt="Original"
            width={originalWidth}
            height={originalHeight}
          />
          {isHovered && (
            <div
              className={`magnifier`}
              style={{
                left: isHovered ? `calc(${magnifiedX * 100}% + 37.5px)` : "0%",
                top: isHovered ? `calc(${magnifiedY * 100}% + 37.5px)` : "0%",
              }}
            ></div>
          )}
        </div>
        {isHovered && (
          <div
            className={`magnified-image-container absolute left-full top-1/2 -translate-y-1/2`}
          >
            <img
              src={imageLink}
              alt="Magnified"
              className="border border-gray-200 magnified-image"
              style={{
                transform: isHovered
                  ? `scale(2) translate(-${
                      originalWidth
                        ? magnifiedX * originalWidth + "px"
                        : magnifiedX * 100 + "%"
                    }, -${
                      originalHeight
                        ? magnifiedY * originalHeight + "px"
                        : magnifiedY * 100 + "%"
                    })`
                  : "scale(1) translate(0, 0)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MagnifyImage;
