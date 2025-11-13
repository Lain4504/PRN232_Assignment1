// API configuration and types
import { config } from './config';

const API_BASE_URL = config.api.baseUrl;

// Types based on backend DTOs
export interface Post {
  id: string;
  name: string;
  description: string;
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

export interface CreatePostData {
  name: string;
  description: string;
  imageUrl?: string;
  imageFile?: File;
}

export interface UpdatePostData extends CreatePostData {
  id: string;
}

export interface SearchParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: 0 | 1; // 0 = A-Z, 1 = Z-A
}

// API functions
export class PostAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all posts with pagination
  static async getPosts(page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<Post>>> {
    return this.request<PaginatedResponse<Post>>(`/posts?page=${page}&pageSize=${pageSize}`);
  }

  // Get post by ID
  static async getPostById(id: string): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${id}`);
  }

  // Create new post
  static async createPost(postData: CreatePostData): Promise<ApiResponse<Post>> {
    const formData = new FormData();
    formData.append('name', postData.name);
    formData.append('description', postData.description);
    
    if (postData.imageUrl) {
      formData.append('imageUrl', postData.imageUrl);
    }
    
    if (postData.imageFile) {
      formData.append('imageFile', postData.imageFile);
    }

    return this.requestWithFormData<Post>('/posts', formData, 'POST');
  }

  // Update post
  static async updatePost(postData: UpdatePostData): Promise<ApiResponse<Post>> {
    const formData = new FormData();
    formData.append('name', postData.name);
    formData.append('description', postData.description);
    
    if (postData.imageUrl) {
      formData.append('imageUrl', postData.imageUrl);
    }
    
    if (postData.imageFile) {
      formData.append('imageFile', postData.imageFile);
    }

    return this.requestWithFormData<Post>(`/posts/${postData.id}`, formData, 'PUT');
  }

  // Delete post
  static async deletePost(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Search posts
  static async searchPosts(params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const searchParams = new URLSearchParams();
    
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortOrder !== undefined) searchParams.append('sortOrder', params.sortOrder.toString());

    const queryString = searchParams.toString();
    const endpoint = `/posts/search${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Post>>(endpoint);
  }
}
