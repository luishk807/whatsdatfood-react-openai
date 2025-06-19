import { type FC, useState, useEffect } from "react";
import { MainSearchInputType } from "types/index";
import "./index.css";
const MainSearchInput: FC<MainSearchInputType> = ({
  onChange,
  selectedValue,
}) => {
  const [inputValue, setInputValue] = useState("");
  const handleOnChange = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    onChange(value);
  };

  useEffect(() => {
    if (selectedValue) {
      handleSelectedValue(selectedValue);
    }
  }, [selectedValue]);

  const handleSelectedValue = (value: string) => {
    setInputValue(value);
  };

  return (
    <div className="main-search-input-container">
      <input
        className="main-search-input"
        type="text"
        onFocus={(e) => e.target.select()}
        id="searchField"
        placeholder="Type your resturant name"
        onChange={handleOnChange}
        value={inputValue}
      />
    </div>
  );
};

export default MainSearchInput;
