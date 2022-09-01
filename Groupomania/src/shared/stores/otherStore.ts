import { defineStore } from 'pinia';

export interface otherStore {
    burgerMenu: boolean | null;
    information: boolean;
}

export const useOtherStore = defineStore({
    id: "otherStore",
    state: (): otherStore => ({
        burgerMenu: null,
        information: false
    }),
    getters: {},
    actions: {
        toggleBurgerMenu: (): void => {
            if (useOtherStore().$state.burgerMenu == null) {
                useOtherStore().$patch({
                    burgerMenu: true,
                })
            } else {
                useOtherStore().$patch({
                    burgerMenu: !useOtherStore().$state.burgerMenu
                })
            }
        },
    }
});