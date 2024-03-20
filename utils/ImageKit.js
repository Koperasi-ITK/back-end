const imageKit = require("../config/imgkit");

module.exports = {
  upload: async (file) => {
    try {
      const stringFile = file.buffer.toString("base64");
      const originalFileName = file.originalname;

      const uploadFile = await imageKit.upload({
        file: stringFile,
        fileName: originalFileName,
      });

      const data = {
        url: uploadFile.url,
        name: uploadFile.name,
      };

      return data;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  delete: async (fileName) => {
    try {
      // console.log(fileName);
      const file = await imageKit.listFiles({
        searchQuery: `name = "${fileName}"`,
      });

      console.log(file);

      await imageKit.deleteFile(file[0].fileId);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
};
