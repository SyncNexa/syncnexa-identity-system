interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash: string;
  user_country?: string | null;
  user_state?: string | null;
  user_address?: string | null;
  gender?: "male" | "female" | "custom" | null;
  is_verified: boolean;
  profile_image?: string | null;
  user_role: "student" | "developer" | "staff";
  account_status: "active" | "suspended" | "deactivated";
  created_at: Date;
  updated_at: Date;
}

interface Student extends User {
  institution: string;
  matric_number: string;
  department?: string;
  faculty?: string;
  program?: string;
  level?: string;
  graduation_year?: number;
  is_institution_verified?: boolean;
  verification_date?: Date | null;
}

interface Developer extends User {
  organization_name?: string;
  website_url?: string;
  verified?: boolean;
}

interface Staff extends User {
  position?: string;
  department?: string;
  permissions?: Record<string, boolean>; // from JSON column
}
