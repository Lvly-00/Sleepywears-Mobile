export interface Order {
  id: string;
  status: 'PAID' | 'UNPAID';
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  address?: string;
  contact_number: string;
  social_handle?: string;
  created_at: string;
  orders?: Order[]; // Added for the detail view
}