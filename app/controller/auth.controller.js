const utils = require("../../utils/utils");
const { User, Saldo } = require("../models");

const register = async (req, res, next) => {
  try {
    const { roleId, statusAnggotaId, name, email, password } = req.body;

    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (checkEmail) return res.status(409).json(utils.apiError("Email telah terdaftar"));

    // const checkStatus = await statusAnggota.findOne({
    //   where: {
    //     id: id,
    //   },
    // });

    // if (!checkStatus)
    //   return res.status(404).json(utils.apiError("Status tidak ditemukan"));

    const passwordLenght = password.length < 8;
    if (passwordLenght) {
      return res.status(400).json(utils.apiError("Password harus lebih dari 8 karakter"));
    }

    const hashPassword = await utils.createHashData(password);

    const user = await User.create({
      roleId: roleId,
      statusAnggotaId: statusAnggotaId,
      name: name,
      email: email,
      password: hashPassword,
    });

    await Saldo.create({
      userId: user.id,
      saldoIuranWajib: 0,
      saldoIuranSukarela: 0,
      saldoPenjualan: 0,
    });

    const data = {
      name: user.name,
      email: user.email,
      password: user.password,
      userStatusId: user.statusAnggotaId,
      roleId: user.roleId,
    };

    return res.status(201).json(utils.apiSuccess("Pendaftaran akun berhasil", data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) return res.status(400).json(utils.apiError("Email tidak terdaftar"));

    const verifyPassword = await utils.verifyHashData(password, user.password);

    if (!verifyPassword) return res.status(409).json(utils.apiError("Password salah"));

    const payload = { id: user.id, role: user.roleId };

    const token = await utils.createJwt(payload);

    const data = {
      token: token,
    };

    return res.status(200).json(utils.apiSuccess("Login Berhasil", data));
  } catch (error) {
    return res.status(500).json(utils.apiError("kesalahan pada internal server"));
  }
};

module.exports = {
  register,
  login,
};
