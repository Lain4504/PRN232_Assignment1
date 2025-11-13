'use client';

import { useState } from 'react';
import { SearchParams } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface PostSearchProps {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export function PostSearch({ onSearch, loading = false }: PostSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<0 | 1>(0);

  const handleSearch = () => {
    const params: SearchParams = {
      searchTerm: searchTerm.trim() || undefined,
      sortOrder,
      page: 1, // Reset to first page on new search
    };
    onSearch(params);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSortOrder(0);
    onSearch({ page: 1 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Search className="h-5 w-5 text-muted-foreground" />
          Search Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Search Input and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search posts by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-11"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) as 0 | 1)}
            className="h-11 px-4 py-2 border border-border/60 rounded-xl bg-background/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-2 focus:border-ring transition-all duration-200 shadow-sm hover:shadow-md text-sm"
          >
            <option value={0}>Sort A-Z</option>
            <option value={1}>Sort Z-A</option>
          </select>
          <Button onClick={handleSearch} disabled={loading} className="shadow-sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-2 shadow-sm"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

