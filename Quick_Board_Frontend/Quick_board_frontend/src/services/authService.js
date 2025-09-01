export const authService = {
    setToken(token) {
        localStorage.setItem('token', token);
    },

    getToken() {
        return localStorage.getItem('token');
    },

    removeToken() {
        localStorage.removeItem('token');
    },

    isAuthenticated() {
        const token = this.getToken();
        return !!token;
    },

    getUserRole() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        } catch (error) {
            this.removeToken();
            return null;
        }
    }
};
