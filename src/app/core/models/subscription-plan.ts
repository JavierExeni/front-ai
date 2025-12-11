export interface SubscriptionPlan {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  deleted_at: string | null;
  stripe_price_id: string;
  stripe_product_id: string;
  name: string;
  description: string | null;
  price: string;
  credits: number;
  overage_credit_cost: string;
  created_by: number | null;
  updated_by: number | null;
}
