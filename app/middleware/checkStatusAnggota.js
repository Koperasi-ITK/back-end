// file: /middleware/checkStatusAnggota.js

const { User, statusAnggota } = require("../models");
const utils = require("../../utils/utils");

const checkStatus = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;

        const user = await User.findByPk(userId, {
            include: [
                {
                    model: statusAnggota,
                    attributes: ["statusName"]
                }
            ]
        });

        if (!user) return res.status(404).json(utils.apiError("User tidak ditemukan"));

        const statusAnggotaName = user.statusAnggotum ? user.statusAnggotum.statusName : "Status tidak ditemukan";

        if (statusAnggotaName !== "Aktif") {
            return res.status(403).json(utils.apiError("User status tidak aktif"));
        }

        req.userStatus = statusAnggotaName;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
    }
};

module.exports = checkStatus;
