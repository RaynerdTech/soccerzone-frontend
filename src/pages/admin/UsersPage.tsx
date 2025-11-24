// import React, { useEffect, useState } from "react";
// import { getUsers } from "../../api/admindashboard/users";
// import AddUserLayout from "../../components/AdminDashboard/AddUserLayout";
// import AdminUsersList from "../../components/AdminDashboard/AdminUsersList";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   totalBookings: number;
//   lastBooking: string;
// }

// const UsersPage: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       setLoading(true);
//       try {
//         const data = await getUsers();
//         const mappedUsers = data.map((u: any) => ({
//           id: u._id,
//           name: u.name,
//           email: u.email,
//           totalBookings: u.totalBookings || 0,
//           lastBooking: u.lastBooking || "",
//         }));
//         setUsers(mappedUsers);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   return (
//     <div className="p-0">
//        <div className="flex mb-4 mt-10 lg:mt-0">
//       <AddUserLayout onUserAdded={() => console.log("User Added!")} />
//         </div>
//       <h2 className="text-xl font-bold mb-4">User Management</h2>
//       {/* <UserSearchTable
//         users={users}
//         onSearch={(query) => console.log("Searching:", query)}
//       /> */}

//         <AdminUsersList />

//       {loading && <p className="text-gray-500 mt-4">Loading users...</p>}
//     </div>
//   );
// };

// export default UsersPage;


import React, { useEffect, useState } from "react";
import { getUsers } from "../../api/admindashboard/users";
import AddUserLayout from "../../components/AdminDashboard/AddUserLayout";
import AdminUsersList from "../../components/AdminDashboard/AdminUsersList";

interface User {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  lastBooking: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        const mappedUsers: User[] = data.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          totalBookings: u.totalBookings || 0,
          lastBooking: u.lastBooking || "",
        }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-0">
      <div className="flex mb-4 mt-10 lg:mt-0">
        <AddUserLayout onUserAdded={() => console.log("User Added!")} />
      </div>

      <h2 className="text-xl font-bold mb-4">User Management</h2>

      {/* Pass fetched users to AdminUsersList */}
      <AdminUsersList users={users} />

      {loading && <p className="text-gray-500 mt-4">Loading users...</p>}
    </div>
  );
};

export default UsersPage;
