import type { Comment } from '../interfaces/comment.interface';
import axios from 'axios';

let BASE_URL = 'http://localhost:3000/api';

export async function fetchComments(id: number, limit: number, from: number): Promise<Comment[]> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/publications/${id}/comments/?limit=${limit}&from=${from}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
}

export async function fetchCountOfComments(id: number): Promise<number> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/publications/${id}/comments/count`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
}

export async function removeComment(id: number, id_comment: number): Promise<any> {
    const response = await axios({
        method: 'delete',
        url: `${BASE_URL}/publications/${id}/comments/${id_comment}`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
    return response;
}

export async function addComment(id: number, data: any): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/publications/${id}/comments`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: {
            "content": data
        },
    })
    return response;
}