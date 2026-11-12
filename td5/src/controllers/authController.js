import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'; // Use a default secret key if not set in environment variables

// Register a new user 
export async function registerUser(email, password) {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ email, password: hashedPassword });
        const savedUser = await newUser.save();
        const { password: _, ...userWithoutPassword } = savedUser.toObject();
        return { success: true, data: userWithoutPassword };
    }
    catch (err) {
        return { success: false, message: "Failed to register user " + err };
    }
}

// Authenticate a user
export async function loginUser(email, password) {
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return { success: false, message: "User not found or invalid credentials" };
        }

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: "User not found or invalid credentials" };
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        const { password: _, ...userWithoutPassword } = user.toObject();
        return { success: true, data: { user: userWithoutPassword, token } };
    }
    catch (err) {
        return { success: false, message: "Failed to login user " + err };
    }
}
