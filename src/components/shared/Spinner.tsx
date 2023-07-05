import { FaSpinner } from "react-icons/fa";

interface SpinnerProps {
  graphLoading: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ graphLoading }) => {
  return (
    <>
      {graphLoading ? (
        <FaSpinner size={32} color="white" className="animate-spin" />
      ) : null}
    </>
  );
};

export default Spinner;
