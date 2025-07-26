import React from 'react';
import "../Concerts.css";

const ScrollComponent = ({ children, setLoadMoreItems }) => {
  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 120) {
      setLoadMoreItems(true)
    }
  };

  return (
    <div
      className="concerts-content-container slight-margin-bottom"
      onScroll={handleScroll}
    >
      <div className='mt-[1.75rem]'></div>
      {children}
    </div>
  );
};

export default ScrollComponent;