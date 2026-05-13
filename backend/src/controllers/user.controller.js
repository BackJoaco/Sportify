import * as userService
    from '../services/user.service.js';

export async function getProfile(req, res) {
    try {
        const user = await userService.getProfile(req.user.id);
        return res.json(user);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}

