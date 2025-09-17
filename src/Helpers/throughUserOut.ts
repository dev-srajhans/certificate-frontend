

import { handleSuccess } from "../utils";
import { clearAccessControlCache } from "../utils/decryptUtils";

export const throughUserOut = (
    navigate: (path: string) => void,
    setIsAuthenticated?: (auth: boolean) => void
) => {
    handleSuccess("Successfully Logged Out!");
    sessionStorage.clear(); // Clear all sessionStorage data
    clearAccessControlCache(); // Clear the access control cache

    // Update authentication state first if callback provided
    if (setIsAuthenticated) {
        setIsAuthenticated(false);
    }

    // Small delay to ensure state updates before navigation
    setTimeout(() => {
        navigate("/login"); // Redirect to login page
    }, 50);
}