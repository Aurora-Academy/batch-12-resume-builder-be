const resumeModel = require("./resume.model");

const list = async ({ page = 1, limit = 10, search }) => {
  const query = [];
  // Search / Filter
  if (search?.title) {
    query.push({
      $match: {
        title: new RegExp(search?.title, "gi"),
      },
    });
  }
  if (search?.user) {
    query.push({
      $match: {
        user: search?.user,
      },
    });
  }

  // Join collection
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        "user.password": 0,
        "user.roles": 0,
        "user.isBlocked": 0,
        "user.isActive": 0,
        "user.__v": 0,
        "user.updatedAt": 0,
        "user._id": 0,
      },
    }
  );
  // Pagination
  query.push(
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    }
  );

  const result = await resumeModel.aggregate(query, { allowDiskUse: true });

  return {
    data: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

const create = (payload) => resumeModel.create(payload);

const getById = (id) => resumeModel.findOne({ _id: id });

const updateById = (id, payload) => {
  const { user, ...rest } = payload;
  return resumeModel.findOneAndUpdate({ _id: id }, rest, { new: true });
};

const remove = (id) => resumeModel.deleteOne({ _id: id });

module.exports = { create, getById, list, remove, updateById };
