import { Grid, IconButton } from "@mui/material";
import Loading from "@/components/Loading";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import "./index.css";
import { SearchButtonInterface } from "@/interfaces";

const SearchButton = <T,>({
  onSubmit,
  showLoading,
  data,
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

  const isActive = !!data;

  const iconButtonProps = {
    onClick: isActive ? onSubmit : undefined,
    className: `main-search-button ${isActive ? "active" : "inactive"}`,
    disabled: !isActive,
  };
  return (
    <Grid
      id="main-search-button-container"
      display="flex"
      justifyContent="end"
      size={{ md: 1, xs: 2 }}
    >
      <IconButton {...iconButtonProps}>
        <ArrowUpwardRoundedIcon className="main-search-button-icon" />
      </IconButton>
    </Grid>
  );
};

export default SearchButton;
