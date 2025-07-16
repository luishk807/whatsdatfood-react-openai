import { type FC, useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainSearchInput from "@/components/MainSearchInput";
import "./index.css";
import { getRestaurantByName } from "@/api/restaurants";
import { RestaurantType } from "@/types/restaurants";
import SearchButton from "../SearchButton";
import { _get } from "@/utils";
import SuggestionsComponent from "../Suggestions";

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
    setSelectedValue("");
    setInputValue(value);
  };

  const handleSuggestions = async () => {
    try {
      const resp = await getRestaurantByName(debounceValue);
      const suggestionArray = Array.isArray(resp) ? resp : [];
      setSuggestions(suggestionArray);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    } finally {
      setShowLoadingIcon(false);
    }
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
    if (!debounceValue) return;
    setShowLoadingIcon(true);
    handleSuggestions();
    setDebounceValue("");
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
        <SuggestionsComponent<RestaurantType>
          suggestions={suggestions}
          show={showSuggestions}
          value={inputValue}
          onClose={() => setShowSuggestions(false)}
          onHandleSelection={handleSelectSuggestion}
        />
      </Grid>
    </Grid>
  );
};

export default MainSearchBar;
