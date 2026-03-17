import { CheckCircle, Shield, Zap, CreditCard, User } from "lucide-react";
import { COLORS } from "./colors";

export const candidateFeatures = [
  { icon: CheckCircle, text: "10.000+ việc làm part-time được xác thực" },
  { icon: Shield, text: "An toàn với hệ thống xác thực doanh nghiệp" },
  { icon: Zap, text: "Nhanh chóng ứng tuyển chỉ trong 30 giây" },
  { icon: CreditCard, text: "Miễn phí hoàn toàn cho ứng viên" }
];

export const employerFeatures = [
  { icon: User, text: "50.000+ ứng viên sẵn sàng làm việc" },
  { icon: Shield, text: "Uy tín với hệ thống xác thực hồ sơ ứng viên" },
  { icon: Zap, text: "Nhanh chóng đăng tin tuyển dụng trong 5 phút" },
  { icon: CreditCard, text: "Hiệu quả tỷ lệ tìm được ứng viên phù hợp cao" }
];

export const authHeroConfig = {
  candidate: {
    title: "Với UNIJOB, tìm việc làm part-time trở nên dễ dàng hơn bao giờ hết",
    subtitle:
      "Nền tảng kết nối ứng viên với hàng ngàn cơ hội việc làm part-time uy tín tại Việt Nam.",
    gradient: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
    features: candidateFeatures
  },

  employer: {
    title: "Tìm kiếm ứng viên chất lượng cho doanh nghiệp của bạn",
    subtitle:
      "Nền tảng tuyển dụng hàng đầu giúp doanh nghiệp kết nối với hàng ngàn ứng viên tiềm năng.",
    gradient: `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueGradient} 100%)`,
    features: employerFeatures
  }
};