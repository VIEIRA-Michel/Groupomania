import axios from 'axios';
import type { Message } from '../interfaces/message.interface';

let BASE_URL = 'http://localhost:3000/api/user';

export async function sendMsg(id: number, message: any, from: any): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/${id}/messages`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: {
            "message": message,
            "from": from,
            "to": id,
        }
    });
    return response;
}

export async function fetchMessages(id: number): Promise<Message[]> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/${id}/messages`,
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