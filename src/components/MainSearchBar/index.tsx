import { type FC, useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import MainSearchInput from "components/MainSearchInput";
import "./index.css";
import { Grid } from "@mui/material";
import { IconButton } from "@mui/material";
import { getBuiltAddress, handleHighlightSuggest } from "utils";
// import { getOpenAIResponse } from "api/openAI";'
import Loading from "components/Loading";
import { getRestaurantByName } from "api/restaurants";
import { _get } from "utils";

const MainSearchBar: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

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
    setShowLoadingIcon(false);
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
    setShowLoadingIcon(true);
    console.log("calling ai");
  };

  useEffect(() => {
    if (debounceValue) {
      console.log("call api", debounceValue);
      setShowLoadingIcon(true);
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
        {showLoadingIcon ? (
          <Loading
            style={{
              width: "30px",
              "margin-right": "10px",
              "margin-top": "5px",
            }}
          />
        ) : (
          <IconButton onClick={handleAIRequest} className="main-search-button">
            <ArrowUpwardRoundedIcon className="main-search-button-icon" />
          </IconButton>
        )}
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
                  const rest_name = _get(suggestion, "name");

                  const address = getBuiltAddress({
                    address: _get(suggestion, "address"),
                    city: _get(suggestion, "city"),
                    state: _get(suggestion, "state"),
                    country: _get(suggestion, "country"),
                    postal_code: _get(suggestion, "postal_code"),
                  });

                  const complete_name = `${rest_name} ${address}`;

                  const new_suggest = handleHighlightSuggest(
                    complete_name,
                    inputValue,
                  );
                  console.log(new_suggest);
                  return (
                    <li
                      onClick={() => handleSelectSuggestion(complete_name)}
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
