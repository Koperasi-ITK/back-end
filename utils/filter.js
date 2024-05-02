module.exports = {
  filterWhereCondition: async (category) => {
    if (category) {
      const categories = Array.isArray(category) ? category : [category];
      filter = {
        ...filter,
        category: {
          slug: {
            in: categories,
          },
        },
      };
    }
  },
};
