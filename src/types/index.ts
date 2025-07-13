export type * from './forms.type'
export type * from './Housing.type'
export type * from './Category.type'
export type * from './Feature.type'
export type * from './Request.type'
export type * from './User.type'
export type * from './SubscriptionPlan.type'
export type * from './News.type'
export type * from './Estate.type'

export type { default as QueryParams } from './QueryParams.type'
export type { default as ServiceResponse } from './ServiceResponse.type'

// Pagination metadata type
export interface PaginationMetadata {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Admin advertisement user type
export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  avatar: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
}

// Admin advertisement category type
export interface AdminCategory {
  id: number;
  name: string;
  key: string;
  main_category: {
    id: number;
    name: string;
  };
  icon: string;
}

// Admin advertisement response type
export interface AdminAdvertisement {
  id: number;
  title: string;
  price: {
    deposit: number;
    rent: number;
    amount: number;
    currency: string;
    is_negotiable: boolean;
    discount_amount: number;
    original_amount: number;
    price_per_unit: number;
    unit: string;
  };
  full_address: {
    id: number;
    province: {
      id: number;
      name: string;
    };
    city: {
      id: number;
      name: string;
    };
    latitude: number;
    longitude: number;
    address: string;
    zip_code: string;
    geolocation: string;
  };
  category: AdminCategory;
  primary_image: string;
  created_at: string;
  updated_at: string;
  status: number;
  user: AdminUser;
  attributes?: any[];
  has_pending_edit?: boolean;
}

export interface AdminAdvertisementResponse {
  items: AdminAdvertisement[];
  metadata: PaginationMetadata;
}
