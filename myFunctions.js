function showMessage(message) {

    var messageBox = document.getElementById("messageBox");

    if (!messageBox) {
        alert(message);
        return;
    }

    clearTimeout(window.messageTimer);
    clearTimeout(window.hideMessageTimer);

    messageBox.innerHTML = message;
    messageBox.style.display = "block";

    messageBox.classList.remove("show");

    window.messageTimer = setTimeout(function () {
        messageBox.classList.add("show");
    }, 30);

    window.hideMessageTimer = setTimeout(function () {

        messageBox.classList.remove("show");

        setTimeout(function () {
            messageBox.style.display = "none";
        }, 400);

    }, 5000);

}
$(document).ready(function () {

    /* إخفاء نموذج التأجير في البداية */

    $("#rentalForm").hide();


    /* إخفاء تفاصيل السيارات في البداية */

    $("#details1, #details2, #details3, #details4, #details5").hide();


  /* إظهار تفاصيل السيارات وإخفاؤها باستخدام مربعات الاختيار */

$("#detailsButton1").change(function () {
    $("#details1").toggle(this.checked);
});

$("#detailsButton2").change(function () {
    $("#details2").toggle(this.checked);
});

$("#detailsButton3").change(function () {
    $("#details3").toggle(this.checked);
});

$("#detailsButton4").change(function () {
    $("#details4").toggle(this.checked);
});

$("#detailsButton5").change(function () {
    $("#details5").toggle(this.checked);
});
    /* زر متابعة التأجير */

    $("#continueButton").click(function () {

        var selectedCars = $("input[name='selectedCars']:checked");

        if (selectedCars.length === 0) {

            showMessage("يرجى اختيار سيارة واحدة على الأقل.");

            return;
        }

        var carCodes = [];

        selectedCars.each(function () {
            carCodes.push($(this).val());
        });

        $("#rentalForm").show();

        showMessage(
            "تم اختيار السيارات: " + carCodes.join("، ")
        );

        document.getElementById("bookingSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });


    /* التحقق من معلومات التأجير وحساب التكلفة */

    $("#rentalForm").submit(function (event) {

        event.preventDefault();


        /* قراءة معلومات العميل */

        var fullName = $("#fullName").val().trim();

        var nationalId = $("#nationalId").val().trim();

        var startValue = $("#startDate").val();

        var endValue = $("#endDate").val();

        var mobile = $("#mobile").val().trim();


        /* التأكد من اختيار سيارة */

        var selectedCars = $("input[name='selectedCars']:checked");

        if (selectedCars.length === 0) {

            showMessage("يرجى اختيار سيارة واحدة على الأقل.");

            return;
        }
        /* التحقق من الاسم العربي */

        if (!/^[\u0600-\u06FF\s]+$/.test(fullName)) {

            showMessage(
                "يرجى إدخال الاسم الكامل باستخدام الأحرف العربية فقط."
            );

            $("#fullName").focus();

            return;
        }


        /* التحقق من الرقم الوطني */

        if (!/^\d{11}$/.test(nationalId)) {

            showMessage(
                "الرقم الوطني يجب أن يتكون من 11 رقمًا."
            );

            $("#nationalId").focus();

            return;
        }


        /* التحقق من بداية الرقم الوطني */

        var governorate = parseInt(
            nationalId.substring(0, 2),
            10
        );

     if (governorate < 1 || governorate > 14) {

            showMessage(
                "يجب أن يكون أول رقميْن من الرقم الوطني بين 01 و14."
            );

            $("#nationalId").focus();

            return;
        }


        /* التأكد من إدخال تاريخ البداية والنهاية */

       if (startValue === "" || endValue === "") {
            showMessage(
                "يرجى تحديد تاريخ بداية ونهاية التأجير."
            );

            return;
        }


        /* تحويل التاريخين إلى كائنين من نوع Date */

        var startDate = new Date(startValue + "T00:00:00");

        var endDate = new Date(endValue + "T00:00:00");


        /* التأكد من أن تاريخ النهاية بعد البداية */

        if (endDate <= startDate) {

            showMessage(
                "تاريخ نهاية التأجير يجب أن يكون بعد تاريخ البداية."
            );

            $("#endDate").focus();

            return;
        }


        /* التحقق من رقم الموبايل */

        if (!/^(093|094|095|096)\d{7}$/.test(mobile)) {

            showMessage(
                "يرجى إدخال رقم موبايل صحيح يبدأ بـ 093 أو 094 أو 095 أو 096."
            );

            $("#mobile").focus();

            return;
        }


        /* حساب عدد أيام التأجير */

        var days = Math.round(
            (endDate.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );


        /* حساب التكلفة الإجمالية للسيارات المختارة */

        var total = 0;

        var selectedCodes = [];

        selectedCars.each(function () {

            var row = $(this).closest("tr");

            var priceText = row.find("td").eq(3).text().trim();

            var price = parseInt(priceText, 10);

            if (isNaN(price) || price <= 0) {
                return;
            }

            total += price * days;

            selectedCodes.push($(this).val());

        });
        /* التأكد من نجاح حساب التكلفة */

        if (total <= 0) {

            showMessage(
                "تعذّر حساب التكلفة. يرجى التأكد من أسعار السيارات."
            );

            return;
        }


        /* حساب الخصم: 10% إذا تجاوزت المدة 7 أيام */

        var discount = 0;

        if (days > 7) {
            discount = total * 0.10;
        }


        /* حساب المبلغ النهائي */

        var finalTotal = total - discount;


        /* عرض النتيجة أسفل النموذج */

        $("#rentalResult").remove();

        var resultHTML =
            '<div id="rentalResult" class="result-box">' +

            '<h3>نتيجة طلب التأجير</h3>' +

            '<p><strong>السيارات المختارة:</strong> ' +
            selectedCodes.join("، ") +
            '</p>' +

            '<p><strong>مدة التأجير:</strong> ' +
            days + ' يومًا</p>' +

            '<p><strong>المجموع قبل الخصم:</strong> ' +
            total.toLocaleString("en-US") +
            ' ل.س</p>' +

            '<p><strong>قيمة الخصم:</strong> ' +
            discount.toLocaleString("en-US") +
            ' ل.س</p>' +

            '<p class="result-total"><strong>المجموع النهائي:</strong> ' +
            finalTotal.toLocaleString("en-US") +
            ' ل.س</p>' +

            '<p>تم التحقق من المعلومات وحساب التكلفة بنجاح.</p>' +

            '</div>';


        $("#rentalForm").append(resultHTML);

        showMessage("تم التحقق من المعلومات وحساب التكلفة بنجاح.");

        document.getElementById("rentalResult").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });

});

/* تبديل الوضع الليلي والنهاري مع حفظ الاختيار */

$(document).ready(function () {

if (localStorage.getItem("theme") === "dark") {
    $("body").addClass("dark-mode");
    $("#themeToggle").html("☀️ الوضع النهاري");
} else {
    $("#themeToggle").html("🌙 الوضع الليلي");
}

$("#themeToggle").click(function () {

    $("body").toggleClass("dark-mode");

    if ($("body").hasClass("dark-mode")) {
        localStorage.setItem("theme", "dark");
        $("#themeToggle").html("☀️ الوضع النهاري");
    } else {
        localStorage.setItem("theme", "light");
        $("#themeToggle").html("🌙 الوضع الليلي");
    }

});

});