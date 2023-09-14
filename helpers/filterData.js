const moment = require("moment");

// filter data
const filterData = async (req, model) => {
  // get the date from user request body
  let { dateFilter, status = "", category = "", limit = "" } = req.body;
  const date = moment(dateFilter).startOf("day");

  // define the query object
  const query = {};

  // add conditions to the query object
  if (dateFilter) {
    Object.assign(query, {
      createdAt: {
        $gte: date.toDate(),
        $lte: date.clone().endOf("day").toDate(),
      },
    });
  }
  if (status && status !== "all") {
    Object.assign(query, {
      status,
    });
  }
  if (category && category !== "all") {
    Object.assign(query, {
      category,
    });
  }

  // check for special cases
  if (limit === "all" || status === "all" || category === "all") {
    limit = undefined;
  }

  // define the pipeline for the aggregation
  const pipeline = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];

  // add limit to the pipeline if it exists
  if (limit) {
    pipeline.push({
      $limit: parseInt(limit),
    });
  }
  // execute the aggregation
  let filteredData = await model.aggregate(pipeline).exec();
  filteredData = filteredData.map((data) => {
    return {
      ...data,
      userId: {
        _id: data.userId[0]._id,
        fullname: data.userId[0].fullname,
        email: data.userId[0].email,
      },
    };
  });
  return filteredData;
};

module.exports = filterData;
