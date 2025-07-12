var incrementalCounter = 0;
var BOOK_METADATA = [];

$(document).ready(function () {
  loadBookData();
  appendBookItem();

  $("#default_book_class").kendoDropDownList({
    dataTextField: "text",
    dataValueField: "value",
    dataSource: bookClassData,
    optionLabel: "請選擇",
    index: 0,
  });

  $("#default_bought_datepicker").kendoDatePicker();

  $("#btn_add_item").click(function (e) {
    e.preventDefault();
    appendBookItem();
  });

  $(document).on("click", ".btnDeleteItem", function (e) {
    e.target.closest(".row").remove();
  });

  $(".btn-add-book").click(function (e) {
    e.preventDefault();

    $.each(
      $("#book_item_container>.row"),
      function (indexInArray, valueOfElement) {
        //Hint #book_item_container>.row  What does this selector mean?(這個選擇器的意思是什麼)
        //foreach ~ valueOfElement What is this
        //了解 foreach ~ valueOfElement 後、如何從裡面找到你需要的東西
      }
    );
  });
});

function loadBookData() {
  BOOK_METADATA = JSON.parse(localStorage.getItem("bookData"));
  if (BOOK_METADATA == null) {
    BOOK_METADATA = bookDataTemp;
    localStorage.setItem("bookData", JSON.stringify(BOOK_METADATA));
  }
}

function appendBookItem() {
  incrementalCounter += 1;

  // Kendo Template kendo 樣板
  // https://docs.telerik.com/kendo-ui/api/javascript/kendo/methods/template
  var template = kendo.template($("#quickBookFormTemplate").html());
  var result = template({ id: incrementalCounter });

  $("#book_item_container").append(result);

  $("[data-identify='bookName']").last().val($("#default_book_name").val());
  //Try These
  //$(".book-name").last().val($("#default_book_name").val());
  //$("[name='bookName';]").last().val($("#default_book_name").val());
}
