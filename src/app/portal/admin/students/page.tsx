'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StudentSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/admin/students/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Search Students</h1>
      
      {/* Search Bar - Accepts Name or ID */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Student Name or unique ID..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {/* Results Section */}
      <div className="mt-8 space-y-4">
        {loading && <p className="text-gray-500">Searching...</p>}
        
        {/* Graceful "No results found" state */}
        {!loading && hasSearched && results.length === 0 && (
          <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No students found matching "{query}"</p>
          </div>
        )}

        {/* List of matching results */}
        {!loading && results.map((student) => (
          <div key={student._id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">ID: {student._id}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
            
            {/* View Profile Button */}
            <Link href={`/portal/admin/students/${student._id}`}>
              <Button variant="outline">View Profile</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
