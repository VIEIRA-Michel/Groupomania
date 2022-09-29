import axios from 'axios';

let BASE_URL = 'http://localhost:3000/api';

export async function fetchRequests(): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/friends/requests`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
}

export async function fetchFriends(id?: any): Promise<any> {
    let url = '';
    if (id) {
        url = `${BASE_URL}/user/${id}/friends`;
    } else {
        url = `${BASE_URL}/friends`;
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

export async function acceptOrDecline(id: number, answer: string): Promise<any> {
    const response = await axios({
        method: 'put',
        url: `${BASE_URL}/friends/requests/${id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: {
            "response": answer
        }
    });
    return response;
}

export async function deleteFriend(id: number): Promise<any> {
    const response = await axios({
        method: 'delete',
        url: `${BASE_URL}/friends/${id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response;
}

export async function searchFriend(search: string): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/friends/search/?search=${search}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response;
}

export async function addFriend(id: number): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/friends/search/${id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response;
}

export async function cancelReq(id: number): Promise<any> {
    const response = await axios({
        method: 'delete',
        url: `${BASE_URL}/friends/requests/${id}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return response;
}

export async function checkReq(): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/friends/requests/sended`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    return response;
}