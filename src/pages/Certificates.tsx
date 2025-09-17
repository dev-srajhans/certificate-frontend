import { ToastContainer } from "react-toastify";
import NavTabs from "../Components/Tabs";

interface CertificatesProps {
  setIsAuthenticated: (auth: boolean) => void;
}

function Certificates({ setIsAuthenticated }: CertificatesProps) {
  return (
    <>
      <NavTabs setIsAuthenticated={setIsAuthenticated} />
      <ToastContainer />
    </>
  );
}

export default Certificates;
