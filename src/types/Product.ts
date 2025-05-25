export interface Product {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  cost: number;
  price: number;
  photo_url?: string;
  availability: boolean;
  business_id?: string;
  sku?: string;
  category?: string;
}
