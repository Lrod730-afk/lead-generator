export type LeadScore = 'HOT' | 'WARM' | 'COLD';

export interface Business {
  _id?: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rating?: number;
  reviewCount?: number;
  hours?: BusinessHours;
  socialMedia?: SocialMedia;
  leadScore: LeadScore;
  needsHelp: string[];
  dateAdded: Date;
  lastContacted?: Date;
  notes?: string;
  contacted?: boolean;
  // Optional metadata
  industry?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
}

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

export interface SearchQuery {
  location: string;
  businessType: string;
  radius?: number;
}

export interface SearchRecord {
  _id?: string;
  location: string;
  businessType: string;
  radius?: number;
  resultsCount: number;
  searchedAt: Date;
}

export interface LeadScoreMetrics {
  hasWebsite: boolean;
  websiteQuality?: 'poor' | 'average' | 'good';
  reviewCount: number;
  rating?: number;
  hasSocialMedia: boolean;
  hasEmail: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  contactedLeads: number;
  searchesToday: number;
}

export interface FilterOptions {
  leadScore?: LeadScore[];
  hasWebsite?: boolean;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
  maxReviews?: number;
  contacted?: boolean;
  searchTerm?: string;
  industry?: string;
}

export interface SortOptions {
  field: 'name' | 'rating' | 'reviewCount' | 'dateAdded' | 'leadScore';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface BusinessListResponse {
  businesses: Business[];
  total: number;
  page: number;
  totalPages: number;
}
