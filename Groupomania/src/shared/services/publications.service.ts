import type { Publication } from '../interfaces/publication.interface';
import axios from 'axios';

let BASE_URL = 'http://localhost:3000/api/publications';

export async function fetchPublications(page?: number): Promise<Publication[]> {
    let url = '';
    if (page) {
        url = `${BASE_URL}/?page=${page}`;
    } else {
        url = `${BASE_URL}`;
    }
    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
}

export async function addPublication(data: any): Promise<any> {
    const response = await axios({
        method: 'post',
        url: BASE_URL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: data,
    })
    return response;
};

export async function fetchCountOfPublication(): Promise<number> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/count`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
}

export async function editPublication(id: number, data: any): Promise<any> {
    const response = await axios({
        method: 'put',
        url: `${BASE_URL}/${id}`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: data,
    })
    return response;
}

export async function removePublication(id: number): Promise<any> {
    const response = await axios({
        method: 'delete',
        url: `${BASE_URL}/${id}`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
    })
    return response;
}

export async function fetchLikes(id: number): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/${id}/likes`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
    })
    return response;
}

export async function likeAndDislike(id: number): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/${id}/likes`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
    })
    return response;
}