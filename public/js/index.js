const goUp = document.querySelector(".go-up");
const product = document.querySelector(".product-details form");
const amountLabel = document.querySelectorAll(".quantities label");

const count = document.querySelectorAll(".products-count input");
const minCount = document.querySelectorAll(".products-count .min");
const maxCount = document.querySelectorAll(".products-count .max");

const btnAddToCart = document.querySelector(".add-to-cart");

const btnWallet = document.querySelector(".user-wallet button");
const walletFrom = document.querySelector(".user-wallet #add-balance");
const reviews = document.querySelector(".reviews");
const reviewCount = document.querySelector(".review-count");

const paymentMethod = document.querySelectorAll(".paymentMethod");
const faqs = document.querySelectorAll(".faqs");

const rating = document.querySelectorAll(".form .rating i");

// loading
document.addEventListener("DOMContentLoaded", () => {
  if (loadingWait) {
    loadingWait.style = "display: none";
  }
});

// send form using ja
const filterData = document.querySelectorAll(".filterData");
filterData?.forEach(function (btn) {
  btn.addEventListener("change", function (e) {
    this.parentElement.submit();
  });
});

//show or hide password funcationalty
const showPassword = document.querySelectorAll(".show-password");
const hidePassword = document.querySelectorAll(".hide-password");
const passwordField = document.querySelectorAll(
  ".field input[type='password']"
);

//show password
showPassword?.forEach((icon, i) => {
  icon.addEventListener("click", (e) => {
    passwordField[i].type = "password";
    showPassword[i].style.display = "none";
    hidePassword[i].style.display = "inline-block";
  });
});

//hide password
hidePassword?.forEach((icon, i) => {
  icon.addEventListener("click", (e) => {
    passwordField[i].type = "text";
    hidePassword[i].style.display = "none";
    showPassword[i].style.display = "inline-block";
  });
});

rating?.forEach((radio, y) => {
  radio.addEventListener("click", () => {
    rating.forEach((rate) => rate.setAttribute("class", "bx bx-star"));
    for (let i = 0; i < rating.length; i++) {
      rating[i].setAttribute("class", "bx bxs-star");
      if (y <= i) {
        break;
      }
    }
  });
});

reviewCount?.addEventListener("click", () => {
  reviews.classList.toggle("hide-content");
});

faqs?.forEach((faq) => {
  faq.addEventListener("click", (e) => {
    faq.classList.toggle("hide-content");
  });
});

const bankakAccountNo = document.querySelector(
  ".payment-data #bankakAccountNo"
);
bankakAccountNo?.addEventListener("click", () => {
  fetch("/user/getBankakInfo", {
    method: "GET",
    headers: {
      "Content-Type": "Application/json",
    },
  })
    .then((res) => res.json())
    .then((result) => {
      let html = "";
      for (const account of result) {
        html += `<option value=${account.accountNo}>${account.name} - ${account.accountNo}</option>
      <option value=${account.cardNo}>رقم البطاقة - ${account.cardNo}</option>`;
      }
      bankakAccountNo.innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
    });
});
paymentMethod?.forEach((radio) => {
  radio.addEventListener("click", function (e) {
    const bankakInfo = document.querySelector(".bankakInfo");
    const walletBalance = document.querySelector(
      ".payment-data .wallet-balance"
    );
    if (e.target.value == "بنكك") {
      walletBalance.style = "display: none";
      bankakInfo.classList.remove("hide-bankak");
    } else {
      walletBalance.style = "display: block";
      bankakInfo.classList.add("hide-bankak");
    }
  });
});

btnWallet?.addEventListener("click", () => {
  walletFrom.style = "display: block";
});

const fileUploadMessage = document.querySelector(".file-upload-name");
const fileInput = document.querySelector("#file-uploaded");
const loadingWait = document.querySelector(".loading-wait");
fileInput?.addEventListener("change", function () {
  const file = fileInput.files[0];
  const formData = new FormData();

  formData.append("imageUploaded", file);
  loadingWait.style = "display: flex";
  fetch("/user/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((result) => {
      fileUploadMessage.textContent = result.message + " " + result.imageName;
      loadingWait.style = "display: none";
    })
    .catch((err) => {
      console.log(err);
    });
});

goUp?.addEventListener("click", (e) => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", (e) => {
  if (goUp) {
    if (window.scrollY > 400) {
      goUp.style = "opacity: 1; bottom: 80px;";
    } else {
      goUp.style = "opacity: 0; bottom: 40px;";
    }
  }
});

amountLabel?.forEach((btn, i) => {
  btn.addEventListener("click", function (e) {
    const available = document.querySelectorAll(".quantities .available");
    const amount = document.querySelectorAll(".quantities .amount");
    const amountId = document.querySelectorAll(".quantities .amountId");
    const button = document.querySelectorAll(".product-details .btn");
    const proPrice = document.querySelectorAll(".quantities .pro-price");
    const productPrice = document.querySelector(".product-price");
    amountLabel.forEach(
      (label) => (label.style = "background-color: transparent; color: #000")
    );
    this.style = "background-color: var(--main-color); color: #fff";
    productPrice.style = "display: block";
    available[i].click();
    amount[i].click();
    proPrice[i].click();
    amountId[i].click();

    if (available[i].value > 0) {
      button.forEach((btn) => btn.removeAttribute("disabled"));
      productPrice.innerHTML = `
            <Strong>السعر: </Strong>
            ${proPrice[i].value} ج.س`;
    } else {
      button.forEach((btn) => btn.setAttribute("disabled", "disabled"));
      productPrice.innerHTML =
        '<span class="cancelled">غير متوفر بالمخزون</span>';
    }
  });
});

minCount?.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    if (parseInt(count[i].value) > 1) {
      count[i].value = parseInt(count[i].value) - 1;
    }
  });
});
maxCount?.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    if (parseInt(count[i].value) < 10) {
      count[i].value = parseInt(count[i].value) + 1;
    }
  });
});

btnAddToCart?.addEventListener("click", (e) => {
  product.action = `/cart/${product.productId.value}`;
});

// custom alert and confirm
function onDelete(href, message) {
  swal({
    title: "هل انت متاكد؟",
    text: `هل انت متاكد من حذف هذا ${message}`,
    icon: "warning",
    buttons: ["الغاء", "تاكيد"],
    dangerMode: true,
  }).then((value) => {
    if (value) {
      swal("تم الحذف بنجاح", {
        icon: "success",
        button: false,
      });
      setTimeout(() => {
        location.href = href;
      }, 1000);
    } else {
      swal("تم الغاء الحذف", {
        icon: "success",
      });
    }
  });
}

function onSubmit(form, message) {
  form = document.querySelector(form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    swal({
      title: "هل أنت متأكد؟",
      text: `هل أنت متأكد من  ${message}؟`,
      icon: "warning",
      buttons: ["الغاء", "تأكيد"],
      dangerMode: true,
    }).then((value) => {
      if (value) {
        swal("تم إرسال الطلب بنجاح", {
          icon: "success",
          button: false,
        });
        setTimeout(() => {
          form.submit();
        }, 1500);
      } else {
        swal("تم إلغاء إرسال الطلب", {
          icon: "success",
        });
      }
    });
  });
}

const printReport = document.querySelector(".printReport");

printReport?.addEventListener("click", () => {
  printReport.style.display = "none";
  window.print();
  printReport.style.display = "block";
});
