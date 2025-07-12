var BOOK_METADATA = [];

$(function () {
  loadBookData();

  //下拉選單
  $("#book_class").kendoDropDownList({
    dataTextField: "text",
    dataValueField: "value",
    dataSource: bookClassData,
    index: 0,
    change: onChange,
  });

  $("#bought_datepicker").kendoDatePicker();

  //換圖片
  $("#book_class").on("change", function () {
    const selectedClass = $(this).val();
    if (selectedClass) {
      $("#book-image").attr("src", `image/${selectedClass}.jpg`);
    }
  });
  //彈跳視窗
  $("#window").kendoWindow({
    title: "新增書籍",
    width: "500px",
    visible: false, // 預設不顯示
    modal: true,
    actions: ["Close"],
    draggable: false,
  });

  // 點按鈕才顯示視窗
  $("#openWindowBtn").on("click", function () {
    $("#window").data("kendoWindow").center().open();
  });

  //資料驗證
  window.validator = $("#bookForm")
    .kendoValidator({
      rules: {
        boughtDateValid: function (input) {
          if (input.is("[name='bought_date']")) {
            const val = input.val().trim();
            if (!val) return true;

            const parts = val.split("/");
            if (parts.length !== 3) {
              input.attr(
                "data-boughtDateValid-msg",
                "請輸入正確的日期（例如：2/30、13月為無效）"
              );
              return false;
            }

            const [month, day, year] = parts.map(Number);
            const date = new Date(year, month - 1, day);

            if (
              isNaN(date.getTime()) ||
              date.getFullYear() !== year ||
              date.getMonth() !== month - 1 ||
              date.getDate() !== day
            ) {
              input.attr(
                "data-boughtDateValid-msg",
                "請輸入正確的日期（例如：2/30、13月為無效）"
              );
              return false;
            }

            const today = new Date();
            if (date > today) {
              input.attr("data-boughtDateValid-msg", "購買日期不能是未來日期");
              return false;
            }

            return true;
          }
          return true;
        },
      },
      messages: {
        boughtDateValid: function (input) {
          return input.attr("data-boughtDateValid-msg") || "請輸入有效的日期";
        },
        required: "此欄位為必填",
      },
    })
    .data("kendoValidator");

  $("#bookForm").on("submit", function (e) {
    if (!validator.validate()) {
      e.preventDefault();
      alert("請修正錯誤後再送出！");
      return;
    }

    //資料送出

    const bookclass = $("#book_class").val();
    const name = $("#book_name").val().trim();
    const author = $("#book_author").val().trim();
    const boughtDate = $("#bought_datepicker").val().trim();

    const newBook = {
      id: Date.now(),
      bookclass,
      name,
      author,
      boughtDate,
    };

    //讀取localhost目前的資料
    const stored = localStorage.getItem("BookList");
    const BookList = stored ? JSON.parse(stored) : [];

    //加入新資料
    BookList.push(newBook);

    localStorage.setItem("BookList", JSON.stringify(BookList));

    alert("新增成功！");
    // 清空欄位
    this.reset(); // 清空表單
  });

  //Grid
  $("#book_grid").kendoGrid({
    dataSource: {
      data: BOOK_METADATA,
      schema: {
        model: {
          fields: {
            BookId: { type: "int" },
            BookName: { type: "string" },
            BookClassName: { type: "string" },
            BookAuthor: { type: "string" },
            BookBoughtDate: { type: "string" },
          },
        },
      },
      pageSize: 20,
    },
    toolbar: kendo.template(
      "<div class='book-grid-toolbar'><input class='book-grid-search' placeholder='我想要找......' type='text'></input></div>"
    ),
    height: 550,
    sortable: true,
    pageable: {
      input: true,
      numeric: false,
    },
    columns: [
      { field: "BookId", title: "書籍編號", width: "10%" },
      { field: "BookName", title: "書籍名稱", width: "50%" },
      { field: "BookClassName", title: "書籍種類", width: "10%" },
      { field: "BookAuthor", title: "作者", width: "15%" },
      { field: "BookBoughtDate", title: "購買日期", width: "15%" },
      {
        command: { text: "刪除", click: deleteBook },
        title: " ",
        width: "120px",
      },
    ],
  });

  $(".btn-quick-add-book").click(function (e) {
    e.preventDefault();
    window.location.href = "./quickbook.html";
  });
});

function loadBookData() {
  BOOK_METADATA = JSON.parse(localStorage.getItem("bookData"));
  if (BOOK_METADATA == null) {
    BOOK_METADATA = bookDataTemp;
    localStorage.setItem("bookData", JSON.stringify(BOOK_METADATA));
  }
}

function onChange() {}

function deleteBook(e) {
  var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
  debugger;
  // console.log(dataItem);
  // console.log(dataItem.BookName);

  utility.showNotify("刪除成功");
}
//Kendo Grid command handle
//https://demos.telerik.com/kendo-ui/grid/custom-command
