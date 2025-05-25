export interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  full_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Business {
  id: number;
  name: string;
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: number;
  name: string;
  business_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Employee {
  id: number;
  user_id: number;
  department_id: number;
  position: string;
  salary: number;
  hire_date: Date;
  created_at: Date;
  updated_at: Date;
} 