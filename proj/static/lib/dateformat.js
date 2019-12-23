var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'
];

function monthNumToName(monthnum) {
    return months[monthnum - 1] || '';
}

function monthNameToNum(monthname) {
    var month = months.indexOf(monthname);
    return month ? month + 1 : 0;
}

function splitdate(data) {
    var virDate = data.substring(0,10); //2017-01-02
    var virTime = data.substring(11,19); //00:00:00
    var year = virDate.substring(0,4);
    var day = virDate.substring(8,10);
    var month = monthNumToName(virDate.substring(5,7));
    var hours = virTime.substring(0,2);
    var minute = virTime.substring(3,5);

    return day + hours + minute + " " + month + " " + year;
}

function splitBack(data) {
    if(data.length == 16){
        var years = data.substring(12,16); //191017H Dec 2017
        var hours = data.substring(2,4);
        var minute = data.substring(4,6);
        var month = monthNameToNum(data.substring(8,11)).toString();
        if(month == "0")
        {
            month = "01";
        }
        if(month.length == 1){
            month = "0" + month;
        }
        var day = data.substring(0,2);
        return years + "-" + month + "-" + day + " " + hours + ":" + minute;
    }else{
        return data;
    }
}

function splitLibraryFormat(data){
    if(data) {
        var years = data.substring(11, 15); //191017 Dec 2017
        var hours = data.substring(2, 4);
        var minute = data.substring(4, 6);
        var month = monthNameToNum(data.substring(7, 10)).toString();
        if (month == "0") {
            month = "01";
        }
        if (month.length == 1) {
            month = "0" + month;
        }
        var day = data.substring(0, 2);
        return years + "-" + month + "-" + day;
    }else{
        return data;
    }
}