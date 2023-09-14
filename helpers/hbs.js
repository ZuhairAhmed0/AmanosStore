const mement = require("moment");

module.exports = {
  reduce: function (array, value) {
    if (!array || !value) {
      return 0;
    }
    return array
      .map((prod) => parseInt(prod[value]))
      .reduce((a, b) => a + b, 0);
  },
  length: function (array) {
    if (!array) {
      return 0;
    }
    return array.length;
  },

  formatCurrency: function (number) {
    let value = number;
    if (!number) {
      value = 0;
    }
    return (
      Intl.NumberFormat("en-SD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
      }).format(parseInt(value)) + "ج.س "
    );
  },
  eq: (x, y) => x == y,
  dateFormat: (date, format) => mement(date).format(format),
  ratingIcon: (count) => {
    let rating = ["", "", "", "", ""];

    for (let i = 0; i < count; i++) {
      rating[i] = "s";
    }
    return rating;
  },
  getAtIndex: (arr, i) => arr[i],

  calcSales: (productsDetails, value) => {
    const totalSales = productsDetails
      .flatMap((product) => product.quantities)
      .flatMap((prod) => parseInt(prod[value]))
      .reduce((a, b) => a + b, 0);
    return totalSales;
  },
  calcRatio: (ratio) => (ratio * 0.1) + "%",
  stringify: (obj) => JSON.stringify(obj),
  calcRating: (reviews)  => {
    const total = reviews.map(pro => pro.rating).reduce((a, b) => a + b, 0)
    const average = total / reviews.length;
    return Math.floor(average);
  }
};
