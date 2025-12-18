import * as yup from "yup";

export const discountValidationSchema = yup.object().shape({
  discount_code: yup.string(),
  discount_type: yup.string().required("Discount type is required"),
  discount_value: yup.string().required("Discount value is required"),
  min_quantity: yup.number()
    .typeError("Minimum quantity must be a number")
    .required("Minimum quantity is required")
    .min(0, "Minimum quantity cannot be negative"),
  min_order_value: yup.number()
    .typeError("Minimum order value must be a number")
    .required("Minimum order value is required")
    .min(0, "Minimum order value cannot be negative"),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string()
    .required("End date is required")
    .test(
      'is-after-start',
      'End Date must be after Start Date',
      function (value) {
        const { start_date } = this.parent;
        if (!start_date || !value) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
  status: yup.string().required("Status is required"),
});
