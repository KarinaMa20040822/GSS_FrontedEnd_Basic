var utility={
    showAlert:function(message){
        kendo.alert(message);
    },
    showNotify:function(message){
        var notification=$("<sapn></span>").kendoNotification({
            allowHideAfter: 1000
        });
        notification.getKendoNotification().show(message);
    }
}