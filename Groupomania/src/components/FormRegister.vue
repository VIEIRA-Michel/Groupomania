<template>
    <div id="form">
        <form @submit.prevent="formSubmit" action="" method="">
            <input @input="userInput($event)" data-id="lastname" placeholder="LastName" type="text">
            <input @input="userInput($event)" data-id="firstname" placeholder="Firstname" type="text">
            <input @input="userInput($event)" data-id="email" placeholder="Email" type="text">
            <input @input="userInput($event)" data-id="password" placeholder="Password" type="text">
            <input @input="userInput($event)" data-id="confirm-password" placeholder="Confirm-Password" type="text">
            <input @click="showResults($event)" type="submit">
        </form>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios';

let lastname: string, firstname: string, email: string, password: string, confirmPassword: string = '';

function userInput(event: Event) {
    const target = event.target as HTMLInputElement;

    switch (target.dataset.id) {
        case 'lastname':
            lastname = target.value;
            break;
        case 'firstname':
            firstname = target.value;
            break;
        case 'email':
            email = target.value;
            break;
        case 'password':
            password = target.value;
            break;
        case 'confirm-password':
            confirmPassword = target.value;
            break;
    }
};
function showResults(event: Event) {
    console.log(email);
    console.log(password);
};

function formSubmit() {
    if (lastname && firstname && email && password && confirmPassword) {
        if (password === confirmPassword) {
            axios({
                method: 'post',
                url: 'http://localhost:3000/api/auth/signup',
                data: {
                    lastname: lastname,
                    firstname: firstname,
                    email: email,
                    password: password,
                }
            }).then(response => {
                console.log(response.data.message);
            }).catch(error => {
                console.log(error);
            });
        }
    }

}
</script>

<style>
</style>