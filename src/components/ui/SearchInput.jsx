import { useState } from 'react';

export default function SearchInput({ 
  placeholder = "Search Stars",
  value = "",
  onChange = null,
  width = "132px", // Default desktop width, can be overridden for mobile
  height = "30px", // Default desktop height, can be overridden for mobile
  fontSize = "11px", // Default desktop font size, can be overridden for mobile
  iconSize = 14 // Default desktop icon size, can be overridden for mobile
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };


  return (
    <div 
      className={`flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2 p-2 rounded-md transition-colors duration-200 ${
        isFocused 
          ? 'bg-grey-800 border border-grey-400' 
          : 'bg-grey-600 border border-transparent'
      }`}
      style={{ width, height }}
    >
      {/* Search Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-grow-0 flex-shrink-0 relative"
        preserveAspectRatio="none"
      >
        <g clipPath="url(#clip0_91_2191)">
          <path
            d="M5.8627 0.422119C8.90102 0.422223 11.3641 2.88543 11.3641 5.92377C11.3641 7.30873 10.8519 8.57395 10.0072 9.54105L13.0703 12.5638L12.5324 13.1086L9.46503 10.0815C8.49987 10.9185 7.24052 11.4252 5.8627 11.4252C2.8243 11.4252 0.360886 8.96216 0.36084 5.92377C0.360869 2.88536 2.82429 0.422119 5.8627 0.422119ZM5.8627 1.18774C3.24713 1.18774 1.12671 3.30821 1.12668 5.92377C1.12672 8.53931 3.24714 10.6596 5.8627 10.6596C8.47817 10.6595 10.5985 8.53925 10.5985 5.92377C10.5985 3.30827 8.47818 1.18785 5.8627 1.18774Z"
            fill="white"
            fillOpacity={isFocused ? 1 : 0.6}
            style={{ fill: 'white', fillOpacity: isFocused ? 1 : 0.6 }}
          />
        </g>
        <defs>
          <clipPath id="clip0_91_2191">
            <rect width="14" height="14" fill="white" style={{ fill: 'white', fillOpacity: 1 }} />
          </clipPath>
        </defs>
      </svg>
      
      {/* Input Field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={isFocused ? "" : placeholder}
        className={`flex-grow font-inter font-normal text-left bg-transparent border-none outline-none ${
          isFocused ? 'text-white' : 'text-grey-200'
        }`}
        style={{ fontSize }}
      />
    </div>
  );
}
