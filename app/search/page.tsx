
// app/search/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

export default function SearchPage() {
    const [persons, setPersons] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ persons: [], orgs: [] });
    const lastTrackedQuery = useRef('');

    useEffect(() => {
        Promise.all([
            fetch('/data/persons.json').then(res => res.json()),
            fetch('/data/organizations.json').then(res => res.json())
        ]).then(([p, o]) => {
            setPersons(p);
            setOrgs(o);
        });
    }, []);

    useEffect(() => {
        const storedQuery = sessionStorage.getItem('amakudari:search-query');
        if (!storedQuery) return;

        sessionStorage.removeItem('amakudari:search-query');
        setQuery(storedQuery);
    }, []);

    useEffect(() => {
        if (query.length > 1) {
            const lowerQuery = query.toLowerCase();
            const personResults = persons.filter((p: any) => 
                p.氏名?.toLowerCase().includes(lowerQuery) ||
                p.離職時官職?.toLowerCase().includes(lowerQuery) ||
                p.再就職先名称?.toLowerCase().includes(lowerQuery)
            ).slice(0, 50);

            const orgResults = orgs.filter((o: any) => 
                o.再就職先名称?.toLowerCase().includes(lowerQuery)
            ).slice(0, 50);
            
            setResults({ persons: personResults, orgs: orgResults });
        } else {
            setResults({ persons: [], orgs: [] });
        }
    }, [query, persons, orgs]);

    useEffect(() => {
        if (query.length <= 1 || query === lastTrackedQuery.current) return;

        const timeout = window.setTimeout(() => {
            trackEvent('site_search', {
                result_count: results.persons.length + results.orgs.length,
                page_type: 'search',
                location: 'search_results',
            });
            lastTrackedQuery.current = query;
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [query, results]);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">検索</h1>
            <input 
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="氏名、官職、法人名などで検索"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-8">
                <h2 className="text-2xl font-bold">法人 ({results.orgs.length})</h2>
                {results.orgs.map((o: any) => (
                    <div key={o.organization_slug} className="bg-gray-800 p-3 my-2 rounded-lg">
                        <Link href={`/organizations/${o.organization_slug}`} className="font-bold text-blue-400 hover:underline">{o.再就職先名称}</Link>
                        <p className="text-sm text-gray-400">受け入れ人数: {o.受け入れ人数}人</p>
                    </div>
                ))}
                <h2 className="text-2xl font-bold mt-6">個人 ({results.persons.length})</h2>
                {results.persons.map((p: any) => (
                    <div key={p.person_slug} className="bg-gray-800 p-3 my-2 rounded-lg">
                        <Link href={`/persons/${p.person_slug}`} className="font-bold text-blue-400 hover:underline">{p.氏名}</Link>
                        <p className="text-sm text-gray-400">元: {p.離職時官職}</p>
                         <p className="text-sm text-gray-300">現: {p.再就職先名称} ({p.再就職先地位})</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
