'use client';

import { useState, useEffect } from 'react';
import { Post, PostAPI, PaginatedResponse, SearchParams } from '@/lib/api';
import { PostCard } from './post-card';
import { PostSearch } from './post-search';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { PostForm } from './post-form';

interface PostGridProps {
  showActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (id: string) => void;
  showSearch?: boolean;
}

export function PostGrid({ showActions = false, onEdit, onDelete, showSearch = true }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [isSearching, setIsSearching] = useState(false);

  const fetchPosts = async (page: number = 1, searchParams?: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (searchParams && Object.keys(searchParams).length > 0) {
        // Use search API if search parameters are provided
        response = await PostAPI.searchPosts({ ...searchParams, page, pageSize: 10 });
        setIsSearching(true);
      } else {
        // Use regular get posts API
        response = await PostAPI.getPosts(page, 10);
        setIsSearching(false);
      }
      
      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<Post>;
        setPosts(paginatedData.data);
        setTotalPages(paginatedData.totalPages);
        setCurrentPage(paginatedData.currentPage);
      } else {
        setError(response.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await PostAPI.deletePost(id);
      if (response.success) {
        await fetchPosts(currentPage, isSearching ? searchParams : undefined);
      } else {
        setError(response.message || 'Failed to delete post');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingPost(null);
    await fetchPosts(currentPage);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentPage(1);
    fetchPosts(1, params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page, isSearching ? searchParams : undefined);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">Posts</h1>
          {showActions && (
            <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Posts</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all posts in the system</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Post</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      )}

      {/* Search Component */}
      {showSearch && (
        <PostSearch onSearch={handleSearch} loading={loading} />
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No posts found</p>
          {showActions && (
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Add your first post
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                showActions={showActions}
                clickable={!showActions}
                onEdit={onEdit || handleEdit}
                onDelete={onDelete || handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Post Form Modal */}
      {showForm && (
        <PostForm
          post={editingPost}
          onClose={() => {
            setShowForm(false);
            setEditingPost(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

