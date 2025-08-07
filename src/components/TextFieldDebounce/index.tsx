import { Box } from "@mui/material";
import { ReactNode, useEffect, useState, useCallback, type FC } from "react";
import "./index.css";
import { TextFieldInterface } from "@/interfaces";
import { debounce } from "lodash";
import TextField from "@/components/TextField";
import useFormHook from "@/customHooks/useForm";

const TextFieldDebounce = <T,>({
  label,
  name,
  isError,
  type = "text",
  isPlaceholder,
  onChange,
  defaultValue,
}: TextFieldInterface<T>) => {
  const [inputValue, setInputValue] = useState("");
  const [loaderElement, setLoaderElement] = useState<ReactNode | null>(null);

  const { checkValidUsername, usernameLoading } = useFormHook();

  const handleOnChange = (value: string) => {
    setInputValue(value);
    setLoaderElement(null);
  };

  const debounceCheckUsername = useCallback(
    debounce(async (username: string) => {
      try {
        const resp = await checkValidUsername(username);

        setLoaderElement(
          resp ? (
            <Box className="loader-message error">
              Username is already being used!
            </Box>
          ) : (
            <Box className="loader-message success">Username is available!</Box>
          ),
        );

        if (!resp) {
          onChange && onChange(inputValue);
        }
      } catch (err) {
        setLoaderElement(
          <Box className="loader-message success">
            Unable to perform search
          </Box>,
        );
      }
    }, 1000),
    [inputValue],
  );

  useEffect(() => {
    if (inputValue) {
      debounceCheckUsername(inputValue);
    } else {
      setLoaderElement(null);
    }

    return () => {
      // cleanup and unmount to cancel any pending call
      debounceCheckUsername.cancel();
    };
  }, [inputValue, debounceCheckUsername]);

  return (
    <TextField
      showLoader={usernameLoading}
      showLoaderElement={loaderElement}
      isPlaceholder={isPlaceholder}
      name={name}
      defaultValue={defaultValue}
      label={label}
      isError={isError}
      type={type}
      onChange={handleOnChange}
    />
  );
};
export default TextFieldDebounce;
