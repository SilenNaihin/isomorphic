import { FaSpinner } from "react-icons/fa";
import {Text } from "~/styles/css"

interface SpinnerProps {
  graphLoading: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ graphLoading }) => {
  return (
    <>
      {graphLoading ? (
        <>
          <FaSpinner size={32} color="white" className="animate-spin" />
          <Text className="mt-4">Reducing dimensionality</Text>
        </>
      ) : null}
    </>
  );
};

export default Spinner;
