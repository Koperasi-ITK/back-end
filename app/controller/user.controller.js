const utils = require("../../utils/utils");
const { User, Role, Saldo, statusAnggota } = require("../models");
const { where } = require("sequelize");
const filter = require("../../utils/filter");
const statusanggota = require("../models/statusanggota");
const { Op } = require("sequelize");
const { logAction,getCurrentTime } = require('../../utils/Logging');

const getUser = async (req, res) => {
  try {
    const { id, email } = req.query;
    let whereClause = {};

    if (id) {
      whereClause.id = id;
    }

    if (email) {
      whereClause.email = {
        [Op.like]: `%${email}%`,
      };
    }

    const users = await User.findAll({
      where: whereClause,
      include: [
        {
          model: statusAnggota,
          attributes: ["statusName"]
        },
        {
          model: Role,
          attributes: ["roleName"]
        },
        {
          model: Saldo,
          attributes: ["saldoIuranWajib", "saldoIuranSukarela", "saldoPenjualan"]
        }
      ]
    });

    const userDetails = users.map(user => {
      const statusAnggotaName = user.statusAnggotum ? user.statusAnggotum.statusName : "Status tidak ditemukan";
      const roleName = user.Role ? user.Role.roleName : "Role tidak ditemukan";
      const { saldoIuranWajib, saldoIuranSukarela, saldoPenjualan } = user.Saldo || {};

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        user_status: user.user_status,
        noTelp: user.noTelp,
        urlProfile: user.urlProfile,
        statusAnggota: statusAnggotaName,
        role: roleName,
        aktifSampai: user.AktifSampai,
        saldoIuranWajib,
        saldoIuranSukarela,
        saldoPenjualan
      };
    });

    return res.status(200).json(utils.apiSuccess("Berhasil mengambil data user", { users: userDetails }));
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = res.locals.user;

    const user = await User.findByPk(userId.id, {
      include: [
        {
          model: statusAnggota,
          attributes: ["statusName"]
        },
        {
          model: Role,
          attributes: ["roleName"]
        },
        {
          model: Saldo,
          attributes: ["saldoIuranWajib", "saldoIuranSukarela", "saldoPenjualan"]
        }
      ]
    });

    if (!user) return res.status(400).json(utils.apiError("User tidak ditemukan"));

    const statusAnggotaName = user.statusAnggotum ? user.statusAnggotum.statusName : "Status tidak ditemukan";
    const roleName = user.Role ? user.Role.roleName : "Role tidak ditemukan";
    const { saldoIuranWajib, saldoIuranSukarela, saldoPenjualan } = user.Saldo || {};

    const data = {
      name: user.name,
      email: user.email,
      user_status: user.user_status,
      noTelp: user.noTelp,
      urlProfile: user.urlProfile,
      statusAnggota: statusAnggotaName,
      role: roleName,
      aktifSampai: user.AktifSampai,
      saldoIuranWajib,
      saldoIuranSukarela,
      saldoPenjualan
    };

    return res.status(200).json(utils.apiSuccess("Data user berhasil diambil", data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const getUserByRole = async (req, res) => {
  try {
    let { page, limit = 20, role } = req.query;

    console.log(role);

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
      include: [
        {
          model: statusAnggota,
          where: {
            statusName: {
              [Op.ne]: "Dihapus"
            }
          }
        }
      ]
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
          where: {
            statusName: {
              [Op.ne]: "Dihapus"
            }
          }
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
  const userId = res.locals.user.id;
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

    await User.update({ AktifSampai: null }, { where: { id: user.id } });

    const statusDihapus = await statusAnggota.findOne({
      where: {
        statusName: "Dihapus",
      },
    });

    if (!statusDihapus) return res.status(404).json(utils.apiError("Status 'Dihapus' tidak ditemukan"));
    await User.update({ statusAnggotaId: statusDihapus.id }, { where: { id: user.id } });
    await logAction(userId, 'menghapus user', new Date(), getCurrentTime());
    return res.status(201).json(utils.apiSuccess(`Berhasil mengubah status ${role.roleName} menjadi Dihapus`));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const updateAktor = async (req, res) => {
  const userId = res.locals.user.id;
  try {
    const { id } = req.params;
    const {
      roleId,
      statusAnggotaId,
      name,
      email,
      password,
      noTelp,
      AktifSampai,
      saldoIuranWajib,
      saldoIuranSukarela,
      saldoPenjualan,
    } = req.body;

    const user = await User.findByPk(id);

    if (!user) return res.status(404).json(utils.apiError("User tidak ditemukan"));

    const saldo = await Saldo.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!saldo) return res.status(404).json(utils.apiError("Saldo User tidak ditemukan"));

    const updatedUserFields = {};
    if (roleId !== undefined) updatedUserFields.roleId = roleId;
    if (name !== undefined) updatedUserFields.name = name;
    if (email !== undefined) updatedUserFields.email = email;
    if (password !== undefined) {
      const hashPassword = await utils.createHashData(password);
      updatedUserFields.password = hashPassword;
    }
    if (noTelp !== undefined) updatedUserFields.noTelp = noTelp;

    if (AktifSampai !== undefined) {
      updatedUserFields.AktifSampai = AktifSampai;
    }

    if (statusAnggotaId !== undefined && statusAnggotaId !== user.statusAnggotaId) {
      updatedUserFields.statusAnggotaId = statusAnggotaId;
      updatedUserFields.AktifSampai = null;
    }

    await User.update(updatedUserFields, { where: { id: user.id } });

    const updatedSaldoFields = {};
    if (saldoIuranWajib !== undefined) updatedSaldoFields.saldoIuranWajib = saldoIuranWajib;
    if (saldoIuranSukarela !== undefined) updatedSaldoFields.saldoIuranSukarela = saldoIuranSukarela;
    if (saldoPenjualan !== undefined) updatedSaldoFields.saldoPenjualan = saldoPenjualan;

    await Saldo.update(updatedSaldoFields, { where: { userId: saldo.userId } });

    const role = await Role.findByPk(user.roleId);
    await logAction(userId, 'update data user', new Date(), getCurrentTime());
    return res.status(200).json(utils.apiSuccess(`${role.roleName} berhasil diupdate`));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const { noTelp } = req.body;


    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json(utils.apiError("User Tidak Ditemukan"));

    const data = await User.update(
      {
        noTelp: noTelp,
      },
      {
        where: {
          id: user.id,
        },
      }
    );
    await logAction(userId, 'update nomor telpon', new Date(), getCurrentTime());
    return res.status(200).json(utils.apiSuccess("Berhasil update Nomor Telpon"));
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
  updateAktor,
  updateProfile,
};
