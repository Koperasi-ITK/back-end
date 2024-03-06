const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/index');
const { Sequelize } = require('sequelize');

exports.register = async (req, res) => {
    try {
        const { nama, email, password, statusName, roleName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = await db.Role.findOne({
            where: { role_name: roleName.toLowerCase() }
        });
        const status = await db.StatusKeanggotaan.findOne({
            where: { status_name: statusName.toLowerCase() }
        });
        const newUser = await db.Users.create({
            nama,
            email,
            password_hash: hashedPassword
        });
    
        await db.User_Role.create({
            user_id: newUser.id,
            role_id: role.role_id
        });
    
        await db.UserStatus.create({
            user_id: newUser.id,
            status_id: status.status_id
        });
    
        res.status(201).json({
            id: newUser.id,
            nama: newUser.nama,
            email: newUser.email,
            status_keanggotaan: status.status_name,
            role: role.role_name
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            const messages = error.errors.map(err => err.message);
            res.status(400).json({ error: "Validation error", messages });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        const roles = await user.getRoles();
        const statuses = await user.getStatuses();

        const token = jwt.sign(
            { 
                userId: user.id, 
                roles: roles.map(r => r.role_name),
                statuses: statuses.map(s => s.status_name) 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await db.Users.findByPk(userId, {
            include: [
                { model: db.Role, as: 'Roles', through: { attributes: [] } },
                { model: db.StatusKeanggotaan, as: 'Statuses', through: { attributes: [] } }
            ]
        });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const roleNames = user.Roles.map(role => role.role_name);
        const statusNames = user.Statuses.map(status => status.status_name);

        res.status(200).json({
            id: user.id,
            nama: user.nama,
            email: user.email,
            roles: roleNames,
            statuses: statusNames
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};