import { type FC, useEffect, useState } from "react";
import clsx from "clsx";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainSearchInput from "@/components/MainSearchInput";
import "./index.css";
import { getBuiltAddress, handleHighlightSuggest } from "@/utils";
import { getRestaurantByName } from "@/api/restaurants";
import { RestaurantType } from "@/types/restaurants";
import SearchButton from "../SearchButton";
import { _get } from "@/utils";

const MainSearchBar: FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [slugName, setSlugName] = useState("");
  const [suggestions, setSuggestions] = useState<RestaurantType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);

  const handleOnChange = (value: any) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setInputValue(value);
  };

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
    if (!slugName) {
      return;
    }
    setShowLoadingIcon(true);
    navigate(`/menu-results/${slugName}`);
  };

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
  }, [suggestions]);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounceValue(inputValue);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

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
          className={clsx("main-search-suggestions-container", {
            "suggestions-container-show": showSuggestions,
            "suggestions-container-hide": !showSuggestions,
          })}
        >
          <div className="main-suggestion-container">
            <ul>
              {suggestions.map((suggestion, indx) => {
                const rest_name = _get<string>(suggestion, "name");
                const slugName = _get<string>(suggestion, "slug");
                const address = getBuiltAddress({
                  address: _get<string>(suggestion, "address"),
                  city: _get<string>(suggestion, "city"),
                  state: _get<string>(suggestion, "state"),
                  country: _get<string>(suggestion, "country"),
                  postal_code: _get<string>(suggestion, "postal_code"),
                });

                const complete_name = address
                  ? `${rest_name} ${address}`
                  : rest_name;

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
