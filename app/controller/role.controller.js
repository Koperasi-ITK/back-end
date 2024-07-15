const utils = require("../../utils/utils");
const { Role,statusAnggota,statusPengiriman   } = require("../models");

const createRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    await Role.create({
      roleName: roleName,
    });

    return res.status(200).json(utils.apiSuccess("Berhasil membuat Role"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("kesalahan pada internal server"));
  }
};

const getAll = async (req, res) => {
  try {
    const roles = await Role.findAll();

    return res
      .status(200)
      .json(utils.apiSuccess("Berhasil menampilkan data Role", roles));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("kesalahan pada internal server"));
  }
};

const updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { roleName } = req.body;

    const role = await Role.findByPk(id);

    if (!role) return res.status(200).json(utils.apiError("Role tidak ditemukan"));

    const update = await Role.update(
      {
        data: {
          roleName: roleName,
        },
      },
      {
        where: {
          id: role.id,
        },
      }
    );

    return res.status(200).json(utils.apiSuccess("Berhasil Mengubah Role", update));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("kesalahan pada internal server"));
  }
};

const deleteRole = async (req, res) => {
  try {
    const id = req.params.id;

    const checkRole = await Role.findByPk(id);

    if (!checkRole)
      return res.status(404).json(utils.apiError("Category tidak ditemukan"));

    await Role.destroy({
      where: {
        id: id,
      },
    });
    return res.status(200).json(utils.apiSuccess("Berhasil menghapus role"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const getStatusAnggota = async (req, res) => {
  try {
    const statusAnggotas = await statusAnggota.findAll();
    return res.status(200).json(utils.apiSuccess("Berhasil menampilkan status anggota", statusAnggotas));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("kesalahan pada internal server"));
  }
};

const getStatusPengiriman = async (req, res) => {
  try {
    const statusPengirimans = await statusPengiriman.findAll();
    return res.status(200).json(utils.apiSuccess("Berhasil menampilkan status pengiriman", statusPengirimans));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("kesalahan pada internal server"));
  }
};

module.exports = {
  createRole,
  getAll,
  updateRole,
  deleteRole,
  getStatusAnggota,
  getStatusPengiriman
};
