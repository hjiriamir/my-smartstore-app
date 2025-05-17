import React from "react";
import "./subscription.css";
import { usePathname, useRouter  } from 'next/navigation'; // Remplace useLocation

const Subscription = () => {
  return (
    <div className="pricing-container">
      <h2 className="pricing-title">خطط التسعير</h2>

      <div className="pricing-cards">
        <div className="pricing-card">
          <h3>أساسي</h3>
          <div className="price">$9.99<span>/شهر</span></div>
          <ul className="features">
            <li>الوصول الكمي من قبل عدد معين من المستخدمين.</li>
            <li>إدارة مكتبة المنتجات بالسمات المحددة من قبل المستخدم.</li>
            <li>إدارة مكتبة المنتجات بالسمات المحددة من قبل المستخدم.</li>

            <li>إدارة التسلسل الهرمي للفئات.</li>
            <li>إنشاء مخططات مستقلة بكفاءة.</li>
            <li>انظر تصور المخطط ثلاثي الأبعاد.</li>

            <li>تصدير المخططات التخطيطية إلى PDF وXLSX وSVG.</li>
            <li>إدارة مكتبة المنتجات بالسمات المحددة من قبل المستخدم.</li>
            <li>جرب SmartStore Basic مجانًا لمدة 14 يومًا.</li>
          </ul>
          <button className="cta-button">ابدأ الان</button>
        </div>

        <div className="pricing-card popular">
          <h3>احترافي</h3>
          <div className="price">$19.99<span>/شهر</span></div>
          <ul className="features">
            <li>الوصول الكمي لعدد غير محدود من المستخدمين.</li>
            <li>سهولة إنشاء ومشاركة المخططات وخطط طوابق المتجر.</li>
            <li>تقارير متكاملة لاتخاذ القرارات الصحيحة.</li>

            <li>توثيق المحلات بالصور.</li>
            <li>التحكم في العمليات من خلال إدارة المهام المتكاملة.</li>
            <li>النقل التلقائي للبيانات بين SmartStore والأنظمة الأخرى.</li>

            <li>التجديد التلقائي والاستبدال في المخططات.</li>
            <li>إدارة ملصقات الرف المدمجة في المخططات.</li>
            <li>المجال الخاص بك والتصميم الخاص بك لـ SmartStore Web.</li>
            <li>التكامل والتطورات المخصصة.</li>
            <li>الدعم عبر الإنترنت.</li>

          </ul>
          <button className="cta-button">ابدأ الان</button>
        </div>
      </div>

      {/* Comparaison Table */}
      <div className="comparison-table">
        <h3>مقارنة جميع الميزات</h3>
        <table class="comparison-table">
    <thead>
      <tr>
        <th>الميزات</th>
        <th>الخطة الأساسية</th>
        <th>الخطة الاحترافية</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>النسخة التجريبية</td>
        <td>14 يومًا</td>
        <td>14 يومًا</td>
      </tr>
      <tr>
        <td>تكامل البيانات</td>
        <td>استيراد يدوي</td>
        <td>استيراد يدوي</td>
      </tr>
      <tr>
        <td>نقل البيانات التلقائي عبر FTPS</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>نقل البيانات التلقائي عبر Rest API</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>موصل Data Nature</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>SmartStore Desktop</td>
        <td>إدارة مكتبة المنتجات</td>
        <td>إدارة مكتبة المنتجات</td>
      </tr>
      <tr>
        <td>إدارة مكتبة الفئات</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>إدارة مكتبة التوزيع</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>رسم خطط التوزيع</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>عرض ثلاثي الأبعاد للمحل</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الخطط الذاتية</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>خطط التوزيع بناءً على خطط التوزيع</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>تصدير خطط التوزيع بصيغة PDF و CSV و XLSX</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>عرض ثلاثي الأبعاد لخطة التوزيع</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>Delta للخطط التوزيعية</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>خطط توزيع خاصة بالمتاجر</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الوثائق التصويرية</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>بيانات المبيعات</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>التحليلات</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>التواصل مع المتاجر</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>المدونة</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الاستطلاعات</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الإشعارات التلقائية</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>ملصقات الرفوف</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الطلب التلقائي</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الاستبدالات التلقائية في خطط التوزيع</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>التطوير المخصص</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>SmartStore Web</td>
        <td>الوصول إلى الويب SmartStore</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>النطاق والتصميم الخاص</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>إدارة المهام</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>النماذج</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>القوائم</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الدعم</td>
        <td>التدريب الأولي</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الدلائل</td>
        <td>نعم</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الدعم عبر الإنترنت</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
      <tr>
        <td>الاستشارات المهنية المخصصة</td>
        <td>لا</td>
        <td>نعم</td>
      </tr>
    </tbody>
  </table>
      </div>
    </div>
  );
};

export default Subscription;
