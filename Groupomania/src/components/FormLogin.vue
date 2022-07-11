<template>
    <div id="form">
        <form @submit.prevent="formSubmit" action="" method="">
            <input @input="userInput($event)" data-id="email" type="text">
            <input @input="userInput($event)" data-id="password" type="text">
            <input @click="showResults($event)" type="submit">
        </form>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';

let email: string = '';
let password: string = '';

function userInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.dataset.id == 'email') {
        email = target.value;
    } else if (target.dataset.id == 'password') {
        password = target.value;
    }
};

function showResults(event: Event) {
    console.log(email);
    console.log(password);
};

const api = axios.create({
    baseURL: 'http://localhost:3000/api/auth/login',
    timeout: 2500,
});

function formSubmit() {
    api({
        method: 'post',
        url: 'http://localhost:3000/api/auth/login',
        data: {
            email: email,
            password: password,
        }
    }).then((response => {
        localStorage.setItem('token', response.data.accessToken);
        api.defaults.headers.common.authorization = `Bearer ${response.data.accessToken} `;
        console.log("Vous êtes bien connecté");
    }))
        .catch((error => {
            console.log(error);
        }))
}
</script>

<style>
</style>