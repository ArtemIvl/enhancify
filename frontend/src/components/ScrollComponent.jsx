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
      {children}
    </div>
  );
};

export default ScrollComponent;