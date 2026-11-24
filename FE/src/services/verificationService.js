import { apiRequest } from '../api/api';

/*
 * Tra cứu mã số thuế doanh nghiệp.
 * Trả về { is_valid, tax_code, format_valid, company_info, error }
 * company_info (từ VietQR) gồm: name, internationalName, shortName, address
 */
export const verifyTaxCode = async (taxCode) => {
  const res = await apiRequest('/v1/verification/verify-tax-code', {
    method: 'POST',
    body: JSON.stringify({ tax_code: taxCode })
  });
  return res.tax_verification;
};
