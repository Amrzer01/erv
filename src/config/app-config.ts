import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "مستشار المدينة",
  version: packageJson.version,
  copyright: `© ${currentYear}، مستشار المدينة. جميع الحقوق محفوظة.`,
  meta: {
    title: "نظام إدارة المعتمرين - مستشار المدينة",
    description: "نظام متكامل لإدارة المعتمرين والحجوزات والرحلات وخدمة العملاء والكول سنتر والولاء.",
  },
};
