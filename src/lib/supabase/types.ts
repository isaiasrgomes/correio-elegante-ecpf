export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "AWAITING_PRODUCTION"
  | "COMPLETED";

export type IdentificationMode = "IDENTIFIED" | "ANONYMOUS";

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
      };
      settings: {
        Row: {
          id: string;
          pix_key: string | null;
          pix_enabled: boolean;
          secret_route: string;
          merchant_name: string;
          merchant_city: string;
          product_pix_keys: Record<string, string> | null;
          product_qr_codes: Record<string, string> | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pix_key?: string | null;
          pix_enabled?: boolean;
          secret_route?: string;
          merchant_name?: string;
          merchant_city?: string;
          product_pix_keys?: Record<string, string> | null;
          product_qr_codes?: Record<string, string> | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          status: OrderStatus;
          letter_type: string;
          letter_price: number;
          receiver_name: string;
          receiver_class: string;
          identification_mode: IdentificationMode;
          sender_name: string | null;
          sender_class: string | null;
          message: string;
          spotify_link: string | null;
          polaroid_url: string | null;
          extras: { id: string; quantity: number }[] | null;
          total_amount: number;
          payment_id: string | null;
          payment_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status?: OrderStatus;
          letter_type: string;
          letter_price: number;
          receiver_name: string;
          receiver_class: string;
          identification_mode: IdentificationMode;
          sender_name?: string | null;
          sender_class?: string | null;
          message: string;
          spotify_link?: string | null;
          polaroid_url?: string | null;
          extras?: { id: string; quantity: number }[] | null;
          total_amount: number;
          payment_id?: string | null;
          payment_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
    };
  };
}
