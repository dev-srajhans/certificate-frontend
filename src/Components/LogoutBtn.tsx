import { Button } from "@mui/material";
import React from "react";
import { ToastContainer } from "react-toastify";
import { throughUserOut } from "../Helpers/throughUserOut";
import { useNavigate } from "react-router-dom";

interface LogoutBtnProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const LogoutBtn: React.FC<LogoutBtnProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    throughUserOut(navigate, setIsAuthenticated);
  };

  return <>
    <Button variant="outlined" color="error" onClick={handleLogout}> Logout </Button>
    <ToastContainer />
  </>
};

export default LogoutBtn;
