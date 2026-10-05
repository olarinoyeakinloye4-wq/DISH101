export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'delivered' | 'cancelled';
export interface MenuItem { id:string; name:string; description:string; price:number; category:string; image:string; badge:string|null; available:boolean; created_at:string }
export interface OrderItem { id:string; name:string; quantity:number; unit_price:number; line_total:number }
export interface Order { id:string; customer_name:string; phone:string; address:string; items:OrderItem[]; total:number; status:OrderStatus; payment_reference:string|null; created_at:string }
