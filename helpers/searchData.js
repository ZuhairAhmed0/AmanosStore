const moment = require("moment");

// search data
const searchData = async (req, Model) => {
    
    // execute the aggregation
    const results = await Model.aggregate(pipeline).exec();
    return results;
};

module.exports = searchData;