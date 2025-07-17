import { Box, Grid } from "@mui/material";
import { ChangeEvent, useState, type FC } from "react";
import "./index.css";
import { TextFieldInterface } from "@/interfaces";

const TextField: FC<TextFieldInterface> = ({
  label,
  onChange,
  name,
  isError,
  type = "text",
  isPlaceholder,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputValue(value);
    onChange && onChange(value);
  };
  return (
    <Box id="textfield-container">
      <Grid container className="w-full">
        {!isPlaceholder && (
          <Grid size={12} className="flex justify-start">
            <label htmlFor="inputfield">{label}</label>
          </Grid>
        )}
        <Grid size={12}>
          <input
            className={`w-full py-10 ${isError && "error"}`}
            name={name}
            type={type}
            value={inputValue}
            onChange={onChangeInput}
            {...(isPlaceholder && { placeholder: label })}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default TextField;
