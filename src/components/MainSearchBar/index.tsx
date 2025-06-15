import { type FC, useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import MainSearchInput from "components/MainSearchInput";
import "./index.css";
import { Grid } from "@mui/material";
import { IconButton } from "@mui/material";
import { getOpenAIResponse } from "api/openAI";

const MainSearchBar: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");

  const handleOnChange = (value: any) => {
    setInputValue(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounceValue(inputValue);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleAPIReuest = async () => {
    const resp = await getOpenAIResponse({
      inputText: debounceValue || inputValue,
    });
    console.log(resp);
  };
  useEffect(() => {
    if (debounceValue) {
      console.log("call api", debounceValue);
      handleAPIReuest();
      setDebounceValue("");
    }
  }, [debounceValue]);

  return (
    <Grid container id="main-search-container">
      <Grid
        size={1}
        display="flex"
        justifyContent="left"
        className="main-search-icon-container"
      >
        <AutoAwesomeIcon className="main-search-icon" />
      </Grid>
      <Grid size={9}>
        <MainSearchInput onChange={handleOnChange} />
      </Grid>
      <Grid display="flex" justifyContent="end" size={2}>
        <IconButton onClick={handleAPIReuest} className="main-search-button">
          <ArrowUpwardRoundedIcon className="main-search-button-icon" />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default MainSearchBar;
