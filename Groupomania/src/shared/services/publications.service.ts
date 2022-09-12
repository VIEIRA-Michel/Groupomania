import type { Publication } from '../interfaces/publication.interface';

let BASE_URL = 'http://localhost:3000/api/publications';

export async function fetchPublications(page?: number): Promise<Publication[]> {
    if (page) {
        BASE_URL = `http://localhost:3000/api/publications/?page=${page}`;
    } else {
        BASE_URL = 'http://localhost:3000/api/publications';
    }
    const response = await (await fetch(BASE_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })).json();
    return response;
}