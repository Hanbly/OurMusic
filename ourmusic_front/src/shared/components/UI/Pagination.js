import React from "react";
import "./Pagination.css";

const DOTS = "...";

const getPaginationItems = (currentPage, totalPageCount, siblingCount = 1) => {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageCount <= totalPageNumbers) {
    return Array.from({ length: totalPageCount }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount
  );

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPageCount;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, totalPageCount];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPageCount - rightItemCount + 1 + i
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = [];
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      middleRange.push(i);
    }
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
};


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const paginationItems = getPaginationItems(currentPage, totalPages);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        上一页
      </button>
      {paginationItems.map((item, index) => {
        if (item === DOTS) {
          return (
            <span key={`${item}-${index}`} className="pagination-dots">
              {DOTS}
            </span>
          );
        }
        return (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`pagination-button ${
              currentPage === item ? "active" : ""
            }`}
          >
            {item}
          </button>
        );
      })}
      <button
        className="pagination-button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
    </div>
  );
};

export default Pagination;