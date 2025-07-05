import { Grid, IconButton } from "@mui/material";
import Loading from "@/components/Loading";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import "./index.css";
interface SearchButtonInterface<T> {
  onSubmit: () => void;
  showLoading: T | null;
}
const SearchButton = <T,>({
  onSubmit,
  showLoading,
}: SearchButtonInterface<T>) => {
  if (showLoading) {
    return (
      <Loading
        style={{
          width: "30px",
          marginRight: "10px",
          marginTop: "5px",
        }}
      />
    );
  }
  return (
    <>
      <Grid display="flex" justifyContent="end" size={{ md: 1, xs: 2 }}>
        <IconButton onClick={onSubmit} className="main-search-button">
          <ArrowUpwardRoundedIcon className="main-search-button-icon" />
        </IconButton>
      </Grid>
    </>
  );
};

export default SearchButton;
