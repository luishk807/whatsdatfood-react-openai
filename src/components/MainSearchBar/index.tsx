import { type FC, useEffect, useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainSearchInput from "@/components/MainSearchInput";
import "./index.css";
import { RestaurantType } from "@/interfaces/restaurants";
import SearchButton from "../SearchButton";
import { _get } from "@/utils";
import SuggestionsComponent from "../Suggestions";
import useRestaurantMutation from "@/customHooks/useRestaurantMutations";
const MainSearchBar: FC = () => {
  const navigate = useNavigate();
  const { getRestaurantListByName, getRestaurantListByNameQuery } =
    useRestaurantMutation();
  const { loading } = getRestaurantListByNameQuery;
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [slugName, setSlugName] = useState("");
  const [suggestions, setSuggestions] = useState<RestaurantType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState("");

  const handleOnChange = (value: any) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedValue("");
    setInputValue(value);
  };

  const handleSuggestions = async () => {
    try {
      const resp = await getRestaurantListByName(debounceValue);
      const suggestionArray = Array.isArray(resp) ? resp : [];
      setSuggestions(suggestionArray);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (value: string, slug: string) => {
    setSelectedValue(value);
    setSlugName(slug);
    setSuggestions([]);
  };
  const handleAIRequest = async () => {
    if (!slugName) {
      return;
    }
    navigate(`/menu-results/${slugName}`);
  };

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
  }, [suggestions]);

  useEffect(() => {
    if (!debounceValue) return;
    handleSuggestions();
    setDebounceValue("");
  }, [debounceValue]);

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
      <Grid size={{ md: 1, xs: 2 }} className="flex justify-center">
        <SearchButton<string>
          onSubmit={handleAIRequest}
          showLoading={loading}
          data={inputValue}
        />
      </Grid>

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
