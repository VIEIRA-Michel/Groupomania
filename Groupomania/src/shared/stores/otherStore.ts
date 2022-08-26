import { defineStore } from 'pinia';

export interface otherStore {
    burgerMenu: boolean;
    information: boolean;
}

export const useOtherStore = defineStore({
    id: "otherStore",
    state: (): otherStore => ({
        burgerMenu: false,
        information: false
    }),
    getters: {},
    actions: {
        toggleBurgerMenu: (): void => {
            useOtherStore().$patch({
                burgerMenu: !useOtherStore().$state.burgerMenu
            })
            console.log(useOtherStore().$state.burgerMenu);
        },
        toggleInformation: (): void => {
            useOtherStore().$patch({
                information: !useOtherStore().$state.information
            })
            console.log(useOtherStore().$state.information);
        }
    }
});