export interface Root {
  success: boolean
  data: Data
  message: string
}

export interface Data {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface User {
  id: number
  name: string
  login: string
  role_id: number
  status: number
  firebase_token: string
  warehouse_id: number
  created_at: string
  updated_at: string
  investor_id: number|null
  phone: string|null
  oklad: string
  enter_date: string
  region_id: number|null
  deleted_at: string|null
  is_confirmed: number
  birth_date: string|null
  old_login: string|null
  source_id: string|null
  is_telegram_admin: number
  role: Role
}

export interface Role {
  id: number
  name: string
  display_name: string
  is_warehouse_id_required: number
  created_at: string
  updated_at: string
  perms: string[]
}
