import { type FC, useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainSearchInput from "@/components/MainSearchInput";
import "./index.css";
import { getBuiltAddress, handleHighlightSuggest } from "@/utils";
import { getRestaurantByName } from "@/api/restaurants";
import { RestaurantType } from "@/types";
import SearchButton from "../SearchButton";
import { _get } from "@/utils";

const MainSearchBar: FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [slugName, setSlugName] = useState("");
  const [suggestions, setSuggestions] = useState<RestaurantType[]>([]);
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
    const suggestionArray = Array.isArray(resp) ? resp : [];
    setSuggestions(suggestionArray);
  };

  const handleSelectSuggestion = (value: string, slug: string) => {
    setSelectedValue(value);
    setSlugName(slug);
    setShowLoadingIcon(true);
    setSuggestions([]);
  };
  const handleAIRequest = async () => {
    setShowLoadingIcon(true);
    navigate(`/menu-results/${slugName}`);
  };

  useEffect(() => {
    if (debounceValue) {
      console.log("call api", debounceValue);
      setShowLoadingIcon(true);
      handleSuggestions();
      setDebounceValue("");
    }
  }, [debounceValue]);

  useEffect(() => {
    setShowLoadingIcon(false);
  }, [selectedValue]);

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
      <Grid size={{ md: 10, xs: 9 }}>
        <MainSearchInput
          selectedValue={selectedValue}
          onChange={handleOnChange}
        />
      </Grid>
      <SearchButton<string>
        onSubmit={handleAIRequest}
        showLoading={showLoadingIcon}
        data={inputValue}
      />
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
                  const slugName = _get<string>(suggestion, "slug");
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
                  return (
                    <li
                      onClick={() =>
                        handleSelectSuggestion(complete_name, slugName)
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
