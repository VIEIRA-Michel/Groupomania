import axios from 'axios';
import type { Message } from '../interfaces/message.interface';

let BASE_URL = 'http://localhost:3000/api/user';

export async function sendMsg(id: number, message: any): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/${id}/messages`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: {
            "message": message
        }
    });
    return response;
}

export async function fetchMessages(id: number, limit: number, from: number): Promise<Message[]> {
    // console.log('service', limit, from);
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/${id}/messages/?limit=${limit}&from=${from}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    return response.data;
}

export async function fetchUsers(): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/connected`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    return response;
}

export async function getCount(id: number): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/${id}/messages/count`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    return response;
}