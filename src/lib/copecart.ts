import crypto from "crypto";
import { env } from "@/env";

const COPECART_SECRET = env.COPECART_KEY;

export function verifyCopeCartSignature(
  body: string,
  signature: string | null,
) {
  if (!signature || !COPECART_SECRET) return false;
  const hmacHash = crypto
    .createHmac("sha256", COPECART_SECRET)
    .update(body, "utf-8")
    .digest("base64");
  return hmacHash === signature;
}

/* TYPES */
export type Copecart = {
  affiliate: string;
  buyer_address: string;
  buyer_street: string;
  buyer_house_number: string;
  buyer_address_details: string;
  buyer_city: string;
  buyer_state: string;
  buyer_company_name: string;
  buyer_country: string;
  buyer_country_code: string;
  buyer_email: string;
  buyer_firstname: string | null;
  buyer_id: string | null;
  buyer_lastname: string | null;
  buyer_phone_number: string | null;
  buyer_subscribed_for_newsletter: boolean;
  buyer_vat_number: string | null;
  buyer_zipcode: string | null;
  cash_flow_at: string | null;
  category_name: string | null;
  category_option_name: string | null;
  earned_amount: string | null;
  first_payment: string | null;
  frequency: string | null;
  is_addon: boolean;
  is_cancelled_for: string | null;
  is_upsell: boolean;
  metadata: string | null;
  next_payment_at: string | null;
  next_payments: string | null;
  order_date: string | null;
  order_id: string | null;
  order_time: string | null;
  order_source_identifier: string | null;
  payment_method: string | null;
  payment_plan: string | null;
  payment_status: string | null;
  product_id: string | null;
  product_internal_name: string;
  product_name: string | null;
  product_type: string | null;
  quantity: number;
  rate_number: number;
  shipping_price: string | null;
  tags: string[];
  test_payment: boolean;
  total_number_of_payments: string | null;
  transaction_amount: string | null;
  transaction_vat_amount: string | null;
  transaction_amount_per_product: [
    {
      amount: string | null;
      vat_amount: string | null;
      slug: string | null;
      is_addon: boolean;
      name: string | null;
      internal_name: string | null;
    },
  ];
  transaction_earned_amount: string | null;
  transaction_currency: string | null;
  transaction_date: string | null;
  transaction_id: string | null;
  transaction_processed_at: string | null;
  transaction_type: string | null;
  line_item_amount: string | null;
  line_item_vat_amount: string | null;
  transaction_discount_amount: string | null;
  product_discount_amount: string | null;
  bundle_addon: boolean;
  bundle_id: string | null;
  event_type: string;
};