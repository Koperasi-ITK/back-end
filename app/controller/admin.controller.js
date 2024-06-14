const { Logging, User } = require('../models');
const utils = require("../../utils/utils");
const { Op } = require('sequelize');

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, email } = req.query;
    const offset = (page - 1) * limit;

    const filter = {};
    if (email) {
      filter.email = { [Op.like]: `%${email}%` };
    }

    const logs = await Logging.findAndCountAll({
      include: [
        {
          model: User,
          attributes: ['email'],
          where: filter.email ? { email: filter.email } : {}
        }
      ],
      attributes: ['status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    const formattedLogs = logs.rows.map(log => {
      const date = new Date(log.createdAt);
      const dateString = date.toISOString().split('T')[0];
      const timeString = date.toTimeString().split(' ')[0];

      return {
        email: log.User.email,
        action: log.status,
        time: timeString,
        date: dateString
      };
    });

    res.status(200).json(utils.apiSuccess("Berhasil mengambil log data", {
      totalItems: logs.count,
      totalPages: Math.ceil(logs.count / limit),
      currentPage: parseInt(page),
      items: formattedLogs
    }));
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
  }
};