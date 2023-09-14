const sidebar = document.querySelector(".sidebar");
const dashboardDetails = document.querySelector(".dashboard-detials");
const showSidebar = document.querySelector("#show-sidebar");
const iconSidebar = document.querySelector(".show-sidebar i");
const iconTextSidebar = document.querySelector(".show-sidebar span");
const mediaQueryList = window.matchMedia("(max-width: 668px)");
const mediaQuerySmall = window.matchMedia("(max-width: 468px)");
const selectAllColumns = document.querySelector(".select-all");
const fileUploadName = document.querySelector(".file-upload-name");
const fileUpload = document.querySelector("#file-uploaded");
const loaderWait = document.querySelector(".loading-wait");

// loading
document.addEventListener("DOMContentLoaded", () => {
    if (loaderWait) {
        loaderWait.style = "display: none";
    }
});

const columnsOfTable = document.querySelectorAll(
    ".dashboard table tbody input"
);

showSidebar?.addEventListener("click", (e) => matchMedia(e.target.checked));

mediaQueryList.addListener((e) => matchMedia(e.matches));

window.addEventListener("load", () => {
    matchMedia(mediaQueryList.matches);
})

const matchMedia = (option) => {
    toggleIcon(option);
    if (option) {
        // code to execute if the media query matches
        sidebar.style = "left: -100%";
        dashboardDetails.style = "left: 5px";
        iconTextSidebar.textContent = "show sidebar";
    } else {
        // code to execute if the media query doesn't match
        sidebar.style = "left: 0";
        dashboardDetails.style = "left: 145px";
        iconTextSidebar.textContent = "hide sidebar";
    }
};

const toggleIcon = (option) => {
    if (option) {
        // code to execute if the media query matches
        iconSidebar?.classList.remove("bxs-toggle-right");
        iconSidebar?.classList.add("bx-toggle-left");
    } else {
        // code to execute if the media query doesn't match
        iconSidebar?.classList.add("bxs-toggle-right");
        iconSidebar?.classList.remove("bx-toggle-left");
    }
};
// select all columns

selectAllColumns?.addEventListener("change", (e) => {
    columnsOfTable.forEach((column) => {
        if (column.checked) {
            column.checked = false;
        } else {
            column.checked = true;
        }
    });
});


fileUpload?.addEventListener("change", function () {
    const file = fileUpload.files[0];
    const formData = new FormData();

    formData.append("imageUploaded",
        file);
    formData.append("destination",
        "images");
    loaderWait.style = "display: flex";
    fetch("/dashboard/products/upload",
        {
            method: "POST",
            body: formData,
        })
    .then((res) => res.json())
    .then((result) => {
        fileUploadName.textContent = result.message + " " + result.imageName;
        loaderWait.style = "display: none";
    })
    .catch((err) => {
        console.log(err);
    });
});