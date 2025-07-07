import { LoadingComponentInterface } from "@/interfaces";
import Loading from "@/components/Loading";

const LoadingComponent = <T,>({
  children,
  data,
  type,
  showLoading = true,
  customLoader,
}: LoadingComponentInterface<T>) => {
  if (!data && showLoading) {
    return <Loading type={type} customLoader={customLoader} />;
  }

  return <>{children}</>;
};

export default LoadingComponent;
