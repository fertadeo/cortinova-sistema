
/* eslint-disable */

import { NextApiRequest, NextApiResponse } from 'next';
import connection from '../../components/utils/db';
import { Users} from '../../types/users'; // Ajusta la ruta según sea necesario

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Users[] | { message: string }>
) {
  if (req.method === 'GET') {
    try {
      const [rows] = await connection.query('SELECT id, name, email FROM user');
      const users: Users[] = rows as Users[];
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
