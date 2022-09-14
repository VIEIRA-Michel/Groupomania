import axios from 'axios';

let BASE_URL = 'http://localhost:3000/api';

export async function signUp(lastname: string, firstname: string, email: string, password: string): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/auth/signup`,
        data: {
            lastname: lastname,
            firstname: firstname,
            email: email,
            password: password,
        }
    });
    return response;
}

export async function signIn(email: string, password: string): Promise<any> {
    const response = await axios({
        method: 'post',
        url: `${BASE_URL}/auth/login`,
        data: {
            email: email,
            password: password,
        }
    });
    return response;
}

export async function fetchInformation(): Promise<any> {
    const response = await axios({
        method: 'get',
        url: `${BASE_URL}/user/me`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
    });
    return response;
}

export async function editProfile(data: FormData): Promise<any> {
    const response = await axios({
        method: 'put',
        url: `${BASE_URL}/user/profil`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: data
    });
    return response;
}