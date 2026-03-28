import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: number,
    userFullname: string,
    username: string,
    email: string,
    password: string,
    role: 'admin' | 'technicien' | 'user'
}

interface UserState {
    isLogged: boolean;
    currentUser: User | null;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState: UserState = {
    isLogged: !!storedToken,
    currentUser: storedUser ? JSON.parse(storedUser) : null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.isLogged = true;
            state.currentUser = action.payload.user;
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.isLogged = false;
            state.currentUser = null;

            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        updateProfile: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload;
        }
    }
})

export const { login, logout, updateProfile } = userSlice.actions;
export default userSlice.reducer;