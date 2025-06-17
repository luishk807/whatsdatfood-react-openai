import { type FC, useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import MainSearchInput from "components/MainSearchInput";
import "./index.css";
import { Grid } from "@mui/material";
import { IconButton } from "@mui/material";
import { getOpenAIResponse } from "api/openAI";
import _ from "lodash";
import { getRestaurantByName } from "api/restaurants";

const MainSearchBar: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");

  const handleOnChange = (value: any) => {
    if (suggestions.length) {
      setSuggestions([]);
    }
    setInputValue(value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounceValue(inputValue);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleSuggestions = async () => {
    const resp = await getRestaurantByName(debounceValue);
    setSuggestions(resp.length ? resp : []);
  };

  const handleSelectSuggestion = (value: string) => {
    setSelectedValue(value);
    setSuggestions([]);
  };
  const handleAIRequest = async () => {
    // const resp = await getOpenAIResponse({
    //   inputText: debounceValue || inputValue,
    // });
    console.log("calling ai");
  };

  const handleHighlightSuggest = (value: string) => {
    return value.replace(inputValue, `<b>${inputValue}</b>`);
  };

  useEffect(() => {
    if (debounceValue) {
      console.log("call api", debounceValue);
      handleSuggestions();
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
        <MainSearchInput
          selectedValue={selectedValue}
          onChange={handleOnChange}
        />
      </Grid>
      <Grid display="flex" justifyContent="end" size={2}>
        <IconButton onClick={handleAIRequest} className="main-search-button">
          <ArrowUpwardRoundedIcon className="main-search-button-icon" />
        </IconButton>
      </Grid>
      <Grid size={12} display="flex" justifyContent="center">
        <div
          className={`main-search-suggestions-container ${
            suggestions.length
              ? "suggestions-container-show"
              : "suggestions-container-hide"
          }`}
        >
          <div className="main-suggestion-container">
            <ul>
              {suggestions.length &&
                suggestions.map((suggestion, indx) => {
                  const new_suggest = handleHighlightSuggest(
                    _.get(suggestion, "name"),
                  );
                  return (
                    <li
                      onClick={() =>
                        handleSelectSuggestion(_.get(suggestion, "name"))
                      }
                      key={indx}
                      dangerouslySetInnerHTML={{ __html: new_suggest }}
                    />
                  );
                })}
            </ul>
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default MainSearchBar;
