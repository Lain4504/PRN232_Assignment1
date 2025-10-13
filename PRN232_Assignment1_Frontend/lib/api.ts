// API configuration and types
import { config } from './config';
import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = config.api.baseUrl;

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Types based on backend DTOs
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  error?: {
    errorCode?: string;
    errorMessage?: string;
    validationErrors?: Record<string, string[]>;
  };
  timestamp: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  imageFile?: File;
}

export interface UpdateProductData extends CreateProductData {
  id: string;
}

export interface SearchParams {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sortOrder?: 0 | 1; // 0 = A-Z, 1 = Z-A
}

// Cart and Order types
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CreateOrderRequest {
  paymentMethod: string;
}

// VNPay Payment types
export interface CreatePaymentUrlRequest {
  orderId: string;
}

export interface PaymentUrlResponse {
  paymentUrl: string;
}

export interface PaymentCallbackResponse {
  success: boolean;
  orderId: string;
  transactionId: string;
  message: string;
}

// API functions
export class ProductAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add auth header if required
    if (requireAuth) {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private static async requestWithFormData<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST',
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {};

    // Add auth header if required
    if (requireAuth) {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all products with pagination
  static async getProducts(page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.request<PaginatedResponse<Product>>(`/products?page=${page}&pageSize=${pageSize}`);
  }

  // Get product by ID
  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  // Create new product
  static async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    
    if (productData.imageFile) {
      formData.append('imageFile', productData.imageFile);
    }

    return this.requestWithFormData<Product>('/products', formData, 'POST', true);
  }

  // Update product
  static async updateProduct(productData: UpdateProductData): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    
    if (productData.imageFile) {
      formData.append('imageFile', productData.imageFile);
    }

    return this.requestWithFormData<Product>(`/products/${productData.id}`, formData, 'PUT', true);
  }

  // Delete product
  static async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/products/${id}`, {
      method: 'DELETE',
    }, true);
  }

  // Search products
  static async searchProducts(params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = new URLSearchParams();
    
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortOrder !== undefined) searchParams.append('sortOrder', params.sortOrder.toString());

    const queryString = searchParams.toString();
    const endpoint = `/products/search${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Product>>(endpoint);
  }
}

// Cart API
export class CartAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add auth header
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getCartItems(): Promise<ApiResponse<CartItem[]>> {
    return this.request<CartItem[]>('/cart');
  }

  static async addToCart(request: AddToCartRequest): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>('/cart', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async updateCartItem(productId: string, request: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  static async removeFromCart(productId: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  static async clearCart(): Promise<ApiResponse<null>> {
    return this.request<null>('/cart/clear', {
      method: 'DELETE',
    });
  }

  static async getCartCount(): Promise<ApiResponse<number>> {
    return this.request<number>('/cart/count');
  }
}

// Order API
export class OrderAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add auth header
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>('/orders');
  }

  static async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${orderId}`);
  }

  static async createOrder(request: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Payment API
export class PaymentAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add auth header
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async createPaymentUrl(request: CreatePaymentUrlRequest): Promise<ApiResponse<PaymentUrlResponse>> {
    return this.request<PaymentUrlResponse>('/payment/create-payment-url', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async processCallback(queryParams: URLSearchParams): Promise<ApiResponse<PaymentCallbackResponse>> {
    const queryString = queryParams.toString();
    return this.request<PaymentCallbackResponse>(`/payment/vnpay-callback?${queryString}`, {
      method: 'GET',
    });
  }
}
