import { LoadingComponentInterface } from "@/interfaces";
import Loading from "@/components/Loading";

const LoadingComponent = <T,>({
  children,
  data,
  type,
}: LoadingComponentInterface<T>) => {
  if (!data) {
    return <Loading type={type} />;
  }

  return <>{children}</>;
};

export default LoadingComponent;
