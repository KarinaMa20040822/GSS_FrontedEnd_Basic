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

  $("#bought_datepicker").kendoDatePicker({
    format: "yyyy/MM/dd",
  });

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
          // 只對購買日期是否有效
          if (input.is("[name='bought_date']")) {
            const val = input.val().trim();
            if (!val) return true;

            //分割出來不是三段（月、日、年），表示驗證不通過
            const parts = val.split("/");
            if (parts.length !== 3) {
              input.attr(
                "data-boughtDateValid-msg",
                "請輸入正確的日期（例如：2/30、13月為無效）"
              );
              return false;
            }
            //parts 是一個陣列（例如：["yyyy", "mm", "dd"]）。
            //.map(Number)：把每個字串轉成數字 → [yyyy, mm, dd]
            const [year, month, day] = parts.map(Number);

            //因為js的月份是從0開始算
            const date = new Date(year, month - 1, day);

            // 檢查日期是否有效
            if (
              //isNaN(是否非數字值)
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
    //資料送出

    const bookclass = $("#book_class").data("kendoDropDownList").text(); // ✅ 抓到的是 text（中文）
    const name = $("#book_name").val().trim();
    const author = $("#book_author").val().trim();
    const boughtDate = $("#bought_datepicker").val().trim();

    function getNextBookId() {
      const maxId = getCombinedBookData().reduce((max, book) => {
        const id = Number(book.BookId);
        if (id > max) {
          return id;
        }
        return max;
      }, 0);
      return maxId + 1;
    }
    const newBook = {
      BookId: getNextBookId(), // 假設 maxId 是你在其他地方定義的最大 ID
      BookClassName: bookclass,
      BookName: name,
      BookAuthor: author,
      BookBoughtDate: boughtDate,
    };

    //讀取localhost目前的資料
    const stored = localStorage.getItem("BookList");
    const BookList = stored ? JSON.parse(stored) : [];

    //加入新資料
    BookList.push(newBook);

    localStorage.setItem("BookList", JSON.stringify(BookList));

    alert("新增成功！");
    const grid = $("#book_grid").data("kendoGrid");
    if (grid) {
      grid.dataSource.data(getCombinedBookData());
    }

    // 清空欄位
    refreshGrid();

    this.reset(); // 清空表單
  });

  //Grid

  loadBookData();

  $("#book_grid").kendoGrid({
    dataSource: {
      data: getCombinedBookData(), //  合併資料來源
      sort: { field: "BookId", dir: "asc" }, // ✅ 新增這一行

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
});
function getBooksFromLocalStorage() {
  const stored = localStorage.getItem("BookList");
  return stored ? JSON.parse(stored) : [];
}

function getCombinedBookData() {
  const metadataBooks = BOOK_METADATA.map((book) => ({
    ...book,
    source: "metadata",
  }));
  const localBooks = getBooksFromLocalStorage().map((book) => ({
    ...book,
    source: "local",
  }));

  return metadataBooks.concat(localBooks); // ✅ 有帶 source 屬性的版本
}
//重整grid資料
function refreshGrid() {
  const grid = $("#book_grid").data("kendoGrid");
  if (grid) {
    grid.dataSource.data(getCombinedBookData());
  }
}
$(".btn-quick-add-book").click(function (e) {
  e.preventDefault();
  window.location.href = "./quickbook.html";
});

function loadBookData() {
  let stored = localStorage.getItem("bookData");
  try {
    BOOK_METADATA = stored ? JSON.parse(stored) : bookDataTemp;
  } catch (e) {
    BOOK_METADATA = bookDataTemp;
  }
  localStorage.setItem("bookData", JSON.stringify(BOOK_METADATA)); // 確保儲存一份
}

function onChange() {}

function deleteBook(e) {
  // const grid = $("#book_grid").data("kendoGrid");
  var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
  debugger;
  console.log(dataItem);
  console.log(dataItem.BookName);

  if (!confirm("確定要刪除這本書嗎？")) {
    return;
  }
  if (dataItem.source === "metadata") {
    // 刪除 BOOK_METADATA 中的資料
    BOOK_METADATA = BOOK_METADATA.filter(
      (book) => book.BookId !== dataItem.BookId
    );
    localStorage.setItem("bookData", JSON.stringify(BOOK_METADATA)); // 更新 LocalStorage（如果有儲存）
  } else if (dataItem.source === "local") {
    // 刪除 localStorage 中的資料
    const books = getBooksFromLocalStorage();
    const updated = books.filter((book) => book.BookId !== dataItem.BookId);
    localStorage.setItem("BookList", JSON.stringify(updated));
  }

  utility.showNotify("刪除成功");
  refreshGrid();
}

//Kendo Grid command handle
//https://demos.telerik.com/kendo-ui/grid/custom-command
