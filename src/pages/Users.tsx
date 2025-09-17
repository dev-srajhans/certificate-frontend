import React from 'react';
import UserDashboard from '../Components/UserDashboard/UserDashboard';

interface UsersProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const Users: React.FC<UsersProps> = ({ setIsAuthenticated }) => {
    return <UserDashboard setIsAuthenticated={setIsAuthenticated} />;
};

export default Users; 