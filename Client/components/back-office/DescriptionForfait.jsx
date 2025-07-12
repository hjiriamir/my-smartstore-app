import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { plans } from "./data/plans";
import ForfaitService from "../../src/services/forfaitService"; 
import Swal from "sweetalert2";
import "./forfaits.css";
import { usePathname, useRouter  } from 'next/navigation'; 

function DescriptionForfait({ params }) {
  const router = useRouter();
  const { id } = router.query;
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

  // Générer les dates
  const currentDate = new Date();
  const dateDebut = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const dateFin = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
    .toISOString()
    .split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      nom: formData.lastName,
      prenom: formData.firstName,
      entreprise: formData.company,
      email: formData.email,
      telephone: formData.phone,
      commentaire: formData.comment,
      titre_post: formData.position,
      prix_abonnement: plan.price,
      date_debut: dateDebut,
      date_fin: dateFin,
      forfait: plan.id,
    };

    try {
      const response = await ForfaitService.createDemande(requestData);

      if (response.status === "Success demande ajoutée") {
        Swal.fire({
          title: "تم إرسال طلبك بنجاح!",
          text: "طلبك قيد المعالجة، سنتواصل معك قريبًا.",
          icon: "success",
          confirmButtonText: "حسنًا",
          confirmButtonColor: "#006d77",
        });

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          position: "",
          comment: "",
        });

        setShowForm(false);
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <main>
        <section className="details-hero">
          <h1>{plan.title}</h1>
          <div className="price">
            {plan.price} ريال<span>/شهر</span>
          </div>
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
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>الاسم*</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>إسم الشركة*</label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>البريد الإلكتروني المهني*</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>رقم الهاتف*</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>إسم الوظيفة*</label>
                  <input
                    type="text"
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>تعليق</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="4"
                />
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
