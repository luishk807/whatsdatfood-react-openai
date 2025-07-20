import { Box, Grid } from "@mui/material";
import { ReactNode, useEffect, useState, type FC } from "react";
import "./index.css";
import { TextFieldInterface } from "@/interfaces";

import TextField from "@/components/TextField";
import useFormHook from "@/customHooks/useForm";
const TextFieldDebounce: FC<TextFieldInterface> = ({
  label,
  name,
  isError,
  type = "text",
  isPlaceholder,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [loaderElement, setLoaderElement] = useState<ReactNode | null>(null);
  const [debounceValue, setDebouceValue] = useState("");

  const { checkValidUsername, usernameLoading, usernameError } = useFormHook();

  const handleOnChange = (value: string) => {
    setInputValue(value);
    setLoaderElement(null);
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouceValue(inputValue);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputValue]);

  const checkUsername = async () => {
    const resp = await checkValidUsername(debounceValue);

    setLoaderElement(
      resp ? (
        <Box className="loader-message error">
          Username is already being used!
        </Box>
      ) : (
        <Box className="loader-message success">Username is available!</Box>
      ),
    );
  };

  useEffect(() => {
    if (debounceValue) {
      checkUsername();
    }
  }, [debounceValue]);

  return (
    <TextField
      showLoader={usernameLoading}
      showLoaderElement={loaderElement}
      isPlaceholder={isPlaceholder}
      name={name}
      label={label}
      isError={isError}
      type={type}
      onChange={handleOnChange}
    />
  );
};
export default TextFieldDebounce;
