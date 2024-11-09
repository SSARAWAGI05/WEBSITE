class AuthService {
    constructor() {
        this.users = new Map();
    }

    registerUser(username, email, password) {
        if (this.users.has(username)) {
            throw new Error('Username already exists');
        }
        
        this.users.set(username, {
            email,
            password, // In production, hash the password
            createdAt: new Date()
        });
        
        return { username, email };
    }

    loginUser(username, password) {
        const user = this.users.get(username);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.password !== password) {
            throw new Error('Invalid password');
        }
        
        const token = btoa(`${username}:${Date.now()}`);
        return { username, token };
    }

    verifyToken(token) {
        try {
            const [username, timestamp] = atob(token).split(':');
            return { username, timestamp };
        } catch {
            return null;
        }
    }
}

const authService = new AuthService();