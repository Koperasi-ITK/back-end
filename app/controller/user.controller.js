const { compareSync } = require("bcrypt");
const utils = require("../../utils/utils");
const { User, Role } = require("../models");
const { where } = require("sequelize");
const filter = require("../../utils/filter");

const getUser = async (req, res, next) => {
  try {
    const datas = await User.findAll();

    const data = {
      datas,
    };

    return res.status(200).json(utils.apiSuccess("Berhasil mengambil data user", data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = res.locals.user;

    const user = await User.findByPk(userId.id);

    if (!user) return res.status(400).json(utils.apiError("User tidak ditemukan"));

    const data = {
      // id: User.id,
      name: user.name,
      email: user.email,
      user_status: user.user_status,
      noTelp: user.noTelp,
      urlProfile: user.urlProfile,
    };

    return res.status(200).json(utils.apiSuccess("Data user berhasil diambil", data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = res.locals.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json(utils.apiError("User tidak ditemukan"));

    if (user.password) {
      const verifyOldPassword = await utils.verifyHashData(oldPassword, user.password);

      if (!verifyOldPassword)
        return res.status(409).json(utils.apiError("Password lama salah"));
    }

    const hashPassword = await utils.createHashData(newPassword);

    await User.update(
      { password: hashPassword },
      {
        where: {
          id: user.id,
        },
      }
    );

    return res.status(200).json(utils.apiSuccess("profile berhasil diperbaharui"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const getUserByRole = async (req, res) => {
  try {
    let { page = 1, limit = 20, role } = req.query;

    console.log(role);

    let pages = (page - 1) * limit;

    const roleInfo = await Role.findOne({
      where: {
        roleName: role,
      },
    });

    if (!roleInfo) return res.status(404).json(utils.apiError("Role Tidak Ditemukan"));

    const users = await User.findAndCountAll({
      where: {
        roleId: roleInfo.id,
      },
      limit: limit,
      pages: pages,
    });

    return res.status(200).json(utils.apiSuccess("Data user ditemukan", users));
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getUser,
  getProfile,
  changePassword,
  getUserByRole,
};
