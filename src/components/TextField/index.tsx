import { ChangeEvent, useEffect, useState, type FC } from "react";
import "./index.css";
import { TextFieldInterface } from "@/interfaces";
import Loading from "../Loading";
import { LOADING_TYPES } from "@/customConstants";

const TextField = <T,>({
  label,
  onChange,
  name,
  isError,
  type = "text",
  isPlaceholder,
  showLoader = false,
  showLoaderElement,
  defaultValue,
}: TextFieldInterface<T>) => {
  // Empty string, never undefined: an input given value={undefined} is
  // uncontrolled, and becomes controlled on the first keystroke - which is the
  // "changing an uncontrolled input to be controlled" warning this logged on
  // every form in the app.
  const [inputValue, setInputValue] = useState<string>(
    (defaultValue as string) ?? "",
  );

  // A default that arrives after the first render is the normal case here: the
  // settings form renders before the user has been fetched. Without this the
  // field stays empty however late the data lands.
  useEffect(() => {
    setInputValue((defaultValue as string) ?? "");
  }, [defaultValue]);

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
    onChange && onChange(value);
  };

  return (
    <div id="textfield-container">
      <div className="w-full">
        {!isPlaceholder && (
          <div className="flex justify-start">
            <label htmlFor={name}>{label}</label>
          </div>
        )}
        <div className="relative">
          <input
            className={`${isError && "error"}`}
            id={name}
            name={name}
            type={type}
            value={inputValue}
            autoComplete={name}
            onChange={onChangeInput}
            {...(isPlaceholder && { placeholder: label })}
          />
          {showLoader && (
            <div className="inputfield-loader">
              <Loading type={LOADING_TYPES.SPINER} />
            </div>
          )}
          {showLoaderElement}
        </div>
      </div>
    </div>
  );
};
export default TextField;
