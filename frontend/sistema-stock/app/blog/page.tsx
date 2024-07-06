// pages/users.tsx
'use client'
import { useEffect, useState } from 'react';
import { Users } from '../../types/users'; // Ajusta la ruta según sea necesario

const UsersPage = () => {
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/users')
        if (!response.ok) {
          throw new Error('Error fetching users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    getUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
        
         {user.id} - {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
