"use client";

import InputFields from "@/app/components/inputFields";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

type Props = {
  values: Record<string, string>;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (field: string, value: string) => void;
};

export default function WarehouseLocationInfo({ values, errors, touched, handleChange, setFieldValue }: Props) {
  const { regionOptions, loading, areaOptions } = useAllDropdownListData();

  return (
    <>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Row 1 */}
        <div>
          <InputFields
            required
            label="Location"
            name="location"
            value={values.location}
            onChange={handleChange}
            error={errors?.location && touched?.location ? errors.location : false}
          />
          {errors?.location && touched?.location && (
            <span className="text-xs text-red-500 mt-1">{errors.location}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="City"
            name="city"
            value={values.city}
            onChange={handleChange}
            error={errors?.city && touched?.city ? errors.city : false}
          />
          {errors?.city && touched?.city && (
            <span className="text-xs text-red-500 mt-1">{errors.city}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="Region"
            name="region_id"
            value={values.region_id}
            onChange={handleChange}
            options={loading ? [{ value: '', label: 'Loading...' }] : (regionOptions && regionOptions.length > 0 ? regionOptions : [{ value: '', label: 'No options available' }])}
            error={errors?.region_id && touched?.region_id ? errors.region_id : false}
          />
          {errors?.region_id && touched?.region_id && (
            <span className="text-xs text-red-500 mt-1">{errors.region_id}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="Sub Region"
            name="area_id"
            value={values.area_id}
            onChange={handleChange}
            options={loading ? [{ value: '', label: 'Loading...' }] : (areaOptions && areaOptions.length > 0 ? areaOptions : [{ value: '', label: 'No options available' }])}
            error={errors?.area_id && touched?.area_id ? errors.area_id : false}
          />
          {errors?.area_id && touched?.area_id && (
            <span className="text-xs text-red-500 mt-1">{errors.area_id}</span>
          )}
        </div>
        <div>
          <InputFields
            label="District"
            name="district"
            value={values.district}
            onChange={handleChange}
            error={errors?.district && touched?.district ? errors.district : false}
          />
          {errors?.district && touched?.district && (
            <span className="text-xs text-red-500 mt-1">{errors.district}</span>
          )}
        </div>
        <div>
          <InputFields
            required
            label="Address"
            name="address"
            value={values.address}
            onChange={handleChange}
            error={errors?.address && touched?.address ? errors.address : false}
          />
          {errors?.address && touched?.address && (
            <span className="text-xs text-red-500 mt-1">{errors.address}</span>
          )}
        </div>
        {/* Row 2 */}
        <div>
          <InputFields
            label="Town/Village"
            name="town_village"
            value={values.town_village}
            onChange={handleChange}
            error={errors?.town_village && touched?.town_village ? errors.town_village : false}
          />
          {errors?.town_village && touched?.town_village && (
            <span className="text-xs text-red-500 mt-1">{errors.town_village}</span>
          )}
        </div>
        <div>
          <InputFields
            label="Street"
            name="street"
            value={values.street}
            onChange={handleChange}
            error={errors?.street && touched?.street ? errors.street : false}
          />
          {errors?.street && touched?.street && (
            <span className="text-xs text-red-500 mt-1">{errors.street}</span>
          )}
        </div>
        <div>
          <InputFields
            label="Landmark"
            name="landmark"
            value={values.landmark}
            onChange={handleChange}
            error={errors?.landmark && touched?.landmark ? errors.landmark : false}
          />
          {errors?.landmark && touched?.landmark && (
            <span className="text-xs text-red-500 mt-1">{errors.landmark}</span>
          )}
        </div>
      </div>
    </>
  );
}