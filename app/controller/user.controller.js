const { compareSync } = require("bcrypt");
const utils = require("../../utils/utils");
const { User, Role, Saldo, statusAnggota } = require("../models");
const { where } = require("sequelize");
const filter = require("../../utils/filter");
const statusanggota = require("../models/statusanggota");

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

const getUserByRole = async (req, res) => {
  try {
    let { page = 1, limit = 20, role } = req.query;

    const roleInfo = await Role.findOne({
      where: {
        roleName: role,
      },
    });

    if (!roleInfo)
      return res.status(404).json(utils.apiError(`Role ${role} Tidak Ditemukan`));

    const totalCount = await User.count({
      where: {
        roleId: roleInfo.id,
      },
    });

    let pages = (page - 1) * limit;
    const data = await User.findAll({
      where: {
        roleId: roleInfo.id,
      },
      include: [
        {
          model: statusAnggota,
          attributes: ["statusName"],
        },
        {
          model: Role,
          attributes: ["roleName"],
        },
        {
          model: Saldo,
          attributes: ["saldoIuranWajib", "saldoIuranSukarela", "saldoPenjualan"],
        },
      ],
      limit: limit,
      offset: pages,
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return res
      .status(200)
      .json(utils.apiSuccess(`Data ${role} ditemukan`, { totalPages, data }));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: {
        id: id,
      },
    });

    if (!user) return res.status(404).json(utils.apiError("User tidak ditemukan"));

    const role = await Role.findOne({
      where: {
        id: user.roleId,
      },
    });

    await User.destroy({
      where: {
        id: id,
      },
    });

    return res.status(201).json(utils.apiSuccess(`Berhasil Menghapus ${role.roleName}`));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

module.exports = {
  getUser,
  getProfile,
  getUserByRole,
  deleteUser,
};
