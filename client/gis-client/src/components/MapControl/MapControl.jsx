import React, { useState } from 'react';
import './MapControl.css';

const MapControl = ({ options, defaultValue, onChange }) => {
  const [selected, setSelected] = useState(defaultValue || options[0]);

  const handleSelect = (value) => {
    if (selected === value) return;
    setSelected(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="map-control">
      {options.map((option) => (
        <button
          key={option.value}
          className={`segment ${selected === option.value ? 'active' : ''}`}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default MapControl;