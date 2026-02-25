export interface WikiResult {
    title: string;
    summary: string;
    url: string;
    thumbnail?: string;
}

export async function fetchWikipediaSummary(query: string): Promise<WikiResult> {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Try search
                return await searchWikipedia(query);
            }
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();
        return {
            title: data.title || query,
            summary: data.extract || 'No summary available.',
            url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encoded}`,
            thumbnail: data.thumbnail?.source,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('Wikipedia API error')) {
            throw error;
        }
        throw new Error('Failed to fetch Wikipedia data. Please check your connection.');
    }
}

async function searchWikipedia(query: string): Promise<WikiResult> {
    const encoded = encodeURIComponent(query.trim());
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encoded}&limit=1&format=json&origin=*`;

    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    const titles: string[] = data[1] || [];
    const urls: string[] = data[3] || [];

    if (titles.length === 0) {
        return {
            title: query,
            summary: `No Wikipedia article found for "${query}". Try a different search term.`,
            url: `https://en.wikipedia.org/w/index.php?search=${encoded}`,
        };
    }

    // Fetch summary for first result
    return fetchWikipediaSummary(titles[0]);
}
