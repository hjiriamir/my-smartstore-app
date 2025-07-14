  import { useRouter } from 'next/router';
  import { useState } from 'react';
  import { plans } from "../../components/back-office/data/plans";
  import ForfaitService from "../../src/services/forfaitService"; // Import du service
  import Swal from "sweetalert2";
  import "../../../components/back-office/forfaits.css";

  function DescriptionForfait() {
    const router = useRouter();
    const { id } = router.query;
    console.log("l'id recuperer est ", id);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      comment: "",
    });

    const plan = plans.find((p) => p.id === id);

    if (!plan) {
      return <div className="error">الباقة غير موجودة</div>;
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await ForfaitService.createDemande({
          nom: formData.lastName,
          prenom: formData.firstName,
          entreprise: formData.company,
          email: formData.email,
          telephone: formData.phone,
          commentaire: formData.comment,
          titre_post: formData.position,
          prix_abonnement: plan.price,
          date_debut: new Date().toISOString().split("T")[0],
          date_fin: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
          forfait: plan.id,
        });

        if (response.status === "Success demande ajoutée") {
          Swal.fire({
            title: "تم إرسال طلبك بنجاح!",
            text: "طلبك قيد المعالجة، سنتواصل معك قريبًا.",
            icon: "success",
            confirmButtonText: "حسنًا",
            confirmButtonColor: "#006d77",
          });

          setShowForm(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            company: "",
            position: "",
            comment: "",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "حدث خطأ!",
          text: "فشل إرسال الطلب. يرجى المحاولة مرة أخرى.",
          icon: "error",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#ff4444",
        });
      }
    };

    return (
      <div>
        <main>
          <section className="details-hero">
            <h1>{plan.title}</h1>
            <div className="price">{plan.price} ريال<span>/شهر</span></div>
            <p>{plan.description}</p>
          </section>

          <section className="features-details">
            <h2>المميزات:</h2>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </section>

          <button className="cta-button" onClick={() => setShowForm(!showForm)}>
            أرسل طلبا
          </button>

          {showForm && (
            <section className="contact-form">
              <h3>طلب للحصول على المعلومات</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>اللقب*</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>الاسم*</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>البريد الإلكتروني المهني*</label>
                  <input type="email" name="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>

                <button type="submit" className="submit-btn">
                  أرسل طلبا
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    );
  }

  export default DescriptionForfait;
