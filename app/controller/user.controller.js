const { compareSync } = require("bcrypt");
const utils = require("../../utils/utils");
const { User } = require("../models");
const { where } = require("sequelize");

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

module.exports = {
  getUser,
  getProfile,
  changePassword,
};
