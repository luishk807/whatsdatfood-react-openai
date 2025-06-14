import { type FC, useState } from "react";
import { MainSearchInputType } from "@/types/indeex";
import "./index.css";
const MainSearchInput: FC<MainSearchInputType> = ({ onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const handleOnChange = (e: any) => {
    const { value } = e.target;
    setInputValue(value);
    onChange(value);
  };

  return (
    <div className="main-search-input-container">
      <input
        className="main-search-input"
        type="text"
        id="searchField"
        placeholder="Type your resturant name"
        onChange={handleOnChange}
        value={inputValue}
      />
    </div>
  );
};

export default MainSearchInput;
