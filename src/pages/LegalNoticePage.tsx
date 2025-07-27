import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const LegalNoticePage = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">
        {t("legalNoticeTitle")}
      </h1>
      <dl className="mb-8 text-gray-800 space-y-4">
        <div>
          <dt className="font-semibold">{t("businessName")}</dt>
          <dd>{t("businessNameValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("operator")}</dt>
          <dd>{t("operatorValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("address")}</dt>
          <dd>{t("addressValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("phoneNumber")}</dt>
          <dd>{t("phoneNumberValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("emailAddress")}</dt>
          <dd>
            <a
              href="mailto:webzero.net@gmail.com"
              className="text-primary-600 hover:underline"
            >
              {t("emailAddressValue")}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-semibold">{t("salesPrice")}</dt>
          <dd>{t("salesPriceDescription")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("additionalFees")}</dt>
          <dd>{t("additionalFeesDescription")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("paymentMethod")}</dt>
          <dd>{t("paymentMethodValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("paymentTiming")}</dt>
          <dd>{t("paymentTimingValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("deliveryMethod")}</dt>
          <dd>{t("deliveryMethodValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("deliveryTiming")}</dt>
          <dd>{t("deliveryTimingValue")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("returnPolicy")}</dt>
          <dd>{t("returnPolicyDescription")}</dd>
        </div>
        <div>
          <dt className="font-semibold">{t("contactInfo")}</dt>
          <dd>{t("contactInfoDescription")}</dd>
        </div>
      </dl>

      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
};

export default LegalNoticePage;
