import * as yup from "yup";

export const pricingValidationSchema = yup.object().shape({
  promotion_name: yup.string().required("Promotion Name is required"),
  from_date: yup.string().required("Start Date is required"),
  to_date: yup.string()
    .required("End Date is required")
    .test(
      'is-after-start',
      'End Date must be after Start Date',
      function (value) {
        const { from_date } = this.parent;
        if (!from_date || !value) {
          return true; // Don't validate if either date is missing (handled by .required)
        }
        return new Date(value) > new Date(from_date);
      }
    ),
  sales_team_type: yup.array().of(yup.string()).min(1, "Sales Team Type is required"),
  project_list: yup.array().when("sales_team_type", {
    is: (val: string[]) => val && val.includes("6"),
    then: (schema) => schema.of(yup.string()).min(1, "Project List is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  items: yup.array().when("item_category", {
    is: (val: any[]) => val && val.length > 0,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) => schema.of(yup.string()).min(1, "At least one item is required"),
  }),
  item_category: yup.array(),
  promotion_details: yup.array().of(
    yup.object().shape({
      from_qty: yup.number()
        .required("From Quantity is required")
        .moreThan(0, "From Quantity must be greater than 0")
        .transform((value) => (isNaN(value) ? undefined : value)),
      to_qty: yup.number()
        .required("To Quantity is required")
        .moreThan(0, "To Quantity must be greater than 0")
        .transform((value) => (isNaN(value) ? undefined : value))
        .test('is-greater', 'To Quantity must be greater than From Quantity', function (value) {
          const { from_qty } = this.parent;
          return !from_qty || !value || value > from_qty;
        }),
      free_qty: yup.number()
        .required("Free Quantity is required")
        .transform((value) => (isNaN(value) ? undefined : value)),
    })
  ).min(1, "At least one promotion detail is required"),
  offer_items: yup.array().of(
    yup.object().shape({
      item_id: yup.string().required("Offer Item is required"),
      uom: yup.string().required("Offer Item UOM is required"),
    })
  ).min(1, "At least one offer item is required"),
});
