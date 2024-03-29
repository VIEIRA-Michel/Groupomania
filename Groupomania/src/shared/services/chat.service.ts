import axios from 'axios';
import type { Message } from '../interfaces/message.interface';

let BASE_URL = 'http://185.224.139.102:3000/api';

export async function sendMsg(id: number, message: any): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/user/${id}/messages`,
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
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/user/${id}/messages/?limit=${limit}&from=${from}`,
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
        url: `${BASE_URL}/user/connected`,
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
        url: `${BASE_URL}/user/${id}/messages/count`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    });
    return response;
}