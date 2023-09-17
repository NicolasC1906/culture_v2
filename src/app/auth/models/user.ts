import { Role } from './role';

export class User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: Role;
  token?: string;
}

export class UserCulture {
  id: number;
  phoneNumber: string;
  password: string;
  verified: boolean;
  member: boolean;
  lastLogin: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  token?: string;
  profile: UserProfile; // Un submodelo para el perfil
  garages: Garage[]; // Un arreglo de garajes
}

export class UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  city: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export class Garage {
  id: number;
  brand: string;
  model: string;
  year: number;
  photo: string; // Asumiendo que photo es una cadena de texto (URL de imagen)
  createdAt: string;
  updatedAt: string;
  userId: number;
}