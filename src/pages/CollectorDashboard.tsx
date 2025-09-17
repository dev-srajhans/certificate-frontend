import CollectorDashboard from "../Components/CollectorDashboard";

interface CollectorDashboardPageProps {
    setIsAuthenticated: (auth: boolean) => void;
}

function CollectorDashboardPage({ setIsAuthenticated }: CollectorDashboardPageProps) {
    return <CollectorDashboard setIsAuthenticated={setIsAuthenticated} />;
}

export default CollectorDashboardPage; 