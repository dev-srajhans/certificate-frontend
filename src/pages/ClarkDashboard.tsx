import ClarkDashboard from "../Components/ClarkDashboard";

interface ClarkDashboardPageProps {
    setIsAuthenticated: (auth: boolean) => void;
}

function ClarkDashboardPage({ setIsAuthenticated }: ClarkDashboardPageProps) {
    return <ClarkDashboard setIsAuthenticated={setIsAuthenticated} />;
}

export default ClarkDashboardPage; 